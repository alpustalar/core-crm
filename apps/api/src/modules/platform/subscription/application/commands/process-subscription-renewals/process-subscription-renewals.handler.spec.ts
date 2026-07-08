import { ProcessSubscriptionRenewalsHandler } from './process-subscription-renewals.handler';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import {
  ISubscriptionCommandRepository,
  ISubscriptionQueryRepository,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { ISubscriptionPaymentMethodQueryRepository } from '@modules/platform/subscription/domain/repositories/subscription-payment-method.repository.interface';
import {
  IBillingAdapter,
  PaymentResult,
} from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { SavedCardChargeModel } from '@modules/platform/subscription/domain/subscription.contracts';
import { randomUUID } from 'crypto';
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

    const subscriptionQueryRepo = {
      findDueForRenewal: jest.fn().mockResolvedValue(opts.due),
      findRenewalCharge: jest
        .fn()
        .mockResolvedValue(
          opts.charge === undefined
            ? { amount: new Decimal(100), currency: 'TRY' }
            : opts.charge
        ),
    } as unknown as ISubscriptionQueryRepository;

    const subscriptionCommandRepo = {
      save: jest.fn(async (s: Subscription) => s),
    } as unknown as ISubscriptionCommandRepository;

    const paymentMethodQueryRepo = {
      findBySubscriptionId: jest
        .fn()
        .mockResolvedValue(
          opts.savedCard === undefined ? savedCard : opts.savedCard
        ),
    } as unknown as ISubscriptionPaymentMethodQueryRepository;

    const billingAdapter = {
      chargeSavedCard,
    } as unknown as IBillingAdapter;

    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new ProcessSubscriptionRenewalsHandler(
      subscriptionQueryRepo,
      subscriptionCommandRepo,
      paymentMethodQueryRepo,
      billingAdapter,
      txManager
    );
    return { handler, subscriptionCommandRepo, chargeSavedCard };
  };

  const newSub = () =>
    Subscription.create({ billingTarget: 'ORGANIZATION', organizationId });

  it('kayıtlı kart + başarılı tahsilat → ACTIVE (renew) + yeni dönem', async () => {
    const sub = newSub();
    const t = build({ due: [sub] });

    await t.handler.execute();

    expect(t.chargeSavedCard).toHaveBeenCalledTimes(1);
    expect(sub.status).toBe('ACTIVE');
    expect(sub.currentPeriodEnd).toBeInstanceOf(Date);
    expect(t.subscriptionCommandRepo.save).toHaveBeenCalledTimes(1);
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
    expect(t.subscriptionCommandRepo.save).not.toHaveBeenCalled();
  });
});
