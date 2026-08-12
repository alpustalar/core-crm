import { HandleSubscriptionCallbackHandler } from './handle-subscription-callback.handler';
import { HandleSubscriptionCallbackCommand } from './handle-subscription-callback.command';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import {
  ISubscriptionCommandRepository,
} from '@modules/platform/subscription/domain/repositories/subscription/subscription.command.repository';
import {
  ISubscriptionPaymentMethodCommandRepository,
} from '@modules/platform/subscription/domain/repositories/subscription-payment-method/subscription-payment-method.command.repository';
import {
  CapturedSavedCard,
  IBillingAdapter,
  PaymentResult,
} from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { randomUUID } from 'crypto';

describe('HandleSubscriptionCallbackHandler', () => {
  const organizationId = randomUUID();

  const capturedCard: CapturedSavedCard = {
    cardUserKey: 'cuk-1',
    cardToken: 'ctk-1',
    maskedNumber: '552608******0006',
    cardAssociation: 'MASTER_CARD',
    cardFamily: 'Bonus',
    buyer: {
      id: organizationId,
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@example.com',
      gsmNumber: '+905551112233',
      ip: '85.34.78.112',
      city: 'Istanbul',
      address: 'Kadikoy',
    },
  };

  const build = (result: PaymentResult) => {
    const subscription = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
      externalId: 'conv-1',
    });

    // Okuma kilitli ve transaction içinde: iyzico callback + webhook aynı anda gelirse
    // dönem iki kez başlatılmamalı.
    const subscriptionCommandRepo = {
      findByExternalIdForUpdate: jest.fn().mockResolvedValue(subscription),
      update: jest.fn(async (s: Subscription) => s),
    } as unknown as ISubscriptionCommandRepository;

    const upsertBySubscriptionId = jest.fn();
    const paymentMethodCommandRepo = {
      upsertBySubscriptionId,
    } as unknown as ISubscriptionPaymentMethodCommandRepository;

    const billingAdapter = {
      handlePaymentResult: jest.fn().mockResolvedValue(result),
    } as unknown as IBillingAdapter;

    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new HandleSubscriptionCallbackHandler(
      subscriptionCommandRepo,
      paymentMethodCommandRepo,
      billingAdapter,
      txManager
    );
    return {
      handler,
      subscription,
      subscriptionCommandRepo,
      upsertBySubscriptionId,
    };
  };

  const command = new HandleSubscriptionCallbackCommand('token-1', 'conv-1');

  it('başarılı ödeme + kayıtlı kart → ACTIVE + ilk dönem + kayıtlı kart persist', async () => {
    const t = build({
      success: true,
      iyzicoPaymentId: 'pay-1',
      savedCard: capturedCard,
    });

    await t.handler.execute(command);

    expect(t.subscription.status).toBe('ACTIVE');
    expect(t.subscription.currentPeriodEnd).toBeInstanceOf(Date);
    expect(t.subscription.externalId).toBe('pay-1');
    expect(t.upsertBySubscriptionId).toHaveBeenCalledTimes(1);
    expect(t.upsertBySubscriptionId).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: t.subscription.id.value,
        cardUserKey: 'cuk-1',
        cardToken: 'ctk-1',
        buyerEmail: 'ada@example.com',
        buyerIp: '85.34.78.112',
      })
    );
  });

  it('başarılı ödeme ama kart saklanmadı → dönem açılır, kart persist edilmez', async () => {
    const t = build({ success: true, iyzicoPaymentId: 'pay-1' });

    await t.handler.execute(command);

    expect(t.subscription.status).toBe('ACTIVE');
    expect(t.subscription.currentPeriodEnd).toBeInstanceOf(Date);
    expect(t.upsertBySubscriptionId).not.toHaveBeenCalled();
  });

  it('başarısız ödeme → PAST_DUE, kart persist edilmez, dönem açılmaz', async () => {
    const t = build({ success: false, errorMessage: 'Kart reddedildi' });

    await t.handler.execute(command);

    expect(t.subscription.status).toBe('PAST_DUE');
    expect(t.subscription.currentPeriodEnd).toBeNull();
    expect(t.upsertBySubscriptionId).not.toHaveBeenCalled();
  });
});
