import { ProcessSubscriptionRenewalsHandler } from './process-subscription-renewals.handler';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import {
  ISubscriptionCommandRepository,
} from '@modules/platform/subscription/domain/repositories/subscription/subscription.command.repository';
import {
  ISubscriptionPaymentMethodCommandRepository,
} from '@modules/platform/subscription/domain/repositories/subscription-payment-method/subscription-payment-method.command.repository';
import {
  IBillingAdapter,
  PaymentResult,
} from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { SavedCardChargeModel } from '@modules/platform/subscription/domain/contracts';
import { randomUUID } from 'crypto';
import { DateTimeManager } from '@common/utils';
import { Decimal } from 'decimal.js';

describe('ProcessSubscriptionRenewalsHandler', () => {
  const organizationId = randomUUID();

  const savedCard: SavedCardChargeModel = {
    cardUserKey: 'cuk-1',
    cardToken: 'ctk-1',
    buyer: {
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@example.com',
      gsmNumber: '+905551112233',
      ip: '85.34.78.112',
      city: 'Istanbul',
      address: null,
    },
  };

  interface BuildOpts {
    due: Subscription[];
    savedCard?: SavedCardChargeModel | null;
    charge?: { amount: Decimal; currency: string } | null;
    chargeResult?: PaymentResult;
  }

  const build = (opts: BuildOpts) => {
    const chargeSavedCard = jest
      .fn<Promise<PaymentResult>, unknown[]>()
      .mockResolvedValue(
        opts.chargeResult ?? { success: true, iyzicoPaymentId: 'pay-1' }
      );

    // Tarama adayları döner; işleme sırasında her abonelik kilitli olarak yeniden
    // okunur (findByIdForUpdate) — mükerrer çekimi engelleyen yeniden doğrulama.
    const subscriptionCommandRepo = {
      findDueForRenewal: jest.fn().mockResolvedValue(opts.due),
      findByIdForUpdate: jest
        .fn()
        .mockImplementation(
          async (id: string) => opts.due.find((s) => s.id.value === id) ?? null
        ),
      findRenewalCharge: jest
        .fn()
        .mockResolvedValue(
          opts.charge === undefined
            ? { amount: new Decimal(100), currency: 'TRY' }
            : opts.charge
        ),
      update: jest.fn(async (s: Subscription) => s),
    } as unknown as ISubscriptionCommandRepository;

    const paymentMethodCommandRepo = {
      findBySubscriptionId: jest
        .fn()
        .mockResolvedValue(
          opts.savedCard === undefined ? savedCard : opts.savedCard
        ),
    } as unknown as ISubscriptionPaymentMethodCommandRepository;

    const billingAdapter = {
      chargeSavedCard,
    } as unknown as IBillingAdapter;

    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    // Zamanlanmış yenileme sistem aktörüyle koşar; handler bugün policy'yi
    // kullanmıyor (enjekte edilmiş ama çağrılmıyor), mock yalnız imzayı karşılar.
    const policyFactory = {} as never;

    const handler = new ProcessSubscriptionRenewalsHandler(
      subscriptionCommandRepo,
      paymentMethodCommandRepo,
      billingAdapter,
      policyFactory,
      txManager
    );
    return { handler, subscriptionCommandRepo, chargeSavedCard };
  };

  /** Dönemi geçmiş (gerçekten yenileme günü gelmiş) abonelik. */
  const newSub = () => {
    const sub = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    const now = DateTimeManager.create();
    sub.startNewPeriod(
      DateTimeManager.addMonths(now, -2),
      DateTimeManager.addMonths(now, -1)
    );
    return sub;
  };

  it('kayıtlı kart + başarılı tahsilat → ACTIVE (renew) + yeni dönem', async () => {
    const sub = newSub();
    const t = build({ due: [sub] });

    await t.handler.execute();

    expect(t.chargeSavedCard).toHaveBeenCalledTimes(1);
    expect(sub.status).toBe('ACTIVE');
    expect(sub.currentPeriodEnd).toBeInstanceOf(Date);
    expect(t.subscriptionCommandRepo.update).toHaveBeenCalledTimes(1);
  });

  it('kayıtlı kart yok → tahsilat denenmez, PAST_DUE', async () => {
    const sub = newSub();
    const t = build({ due: [sub], savedCard: null });

    await t.handler.execute();

    expect(t.chargeSavedCard).not.toHaveBeenCalled();
    expect(sub.status).toBe('PAST_DUE');
  });

  it('kayıtlı kart var ama tahsilat başarısız → PAST_DUE', async () => {
    const sub = newSub();
    const t = build({
      due: [sub],
      chargeResult: { success: false, errorMessage: 'Yetersiz bakiye' },
    });

    await t.handler.execute();

    expect(t.chargeSavedCard).toHaveBeenCalledTimes(1);
    expect(sub.status).toBe('PAST_DUE');
  });

  it('cancelAtPeriodEnd planlı → CANCELED (tahsilat denenmez)', async () => {
    const sub = newSub();
    sub.scheduleCancellation();
    const t = build({ due: [sub] });

    await t.handler.execute();

    expect(t.chargeSavedCard).not.toHaveBeenCalled();
    expect(sub.status).toBe('CANCELED');
  });

  it('dönemi geçmiş abonelik yoksa hiçbir şey yapılmaz', async () => {
    const t = build({ due: [] });
    await t.handler.execute();
    expect(t.subscriptionCommandRepo.update).not.toHaveBeenCalled();
  });

  it('tarama ile işleme arasında dönem ilerlediyse kart ÇEKİLMEZ (mükerrer tahsilat)', async () => {
    // Aday listesine girdikten sonra başka bir çalıştırma aboneliği yenilemiş:
    // kilitli okuma artık dönemi ileride olan hâli döner.
    const stale = newSub();
    const t = build({ due: [stale] });

    const now = DateTimeManager.create();
    const renewed = Subscription.create({
      id: stale.id.value,
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    renewed.startNewPeriod(now, DateTimeManager.addMonths(now, 1));
    (
      t.subscriptionCommandRepo.findByIdForUpdate as jest.Mock
    ).mockResolvedValue(renewed);

    await t.handler.execute();

    expect(t.chargeSavedCard).not.toHaveBeenCalled();
    expect(t.subscriptionCommandRepo.update).not.toHaveBeenCalled();
  });
});
