import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ProcessSubscriptionRenewalsCommand } from './process-subscription-renewals.command';
import {
  ISubscriptionCommandRepository,
  ISubscriptionQueryRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import {
  ISubscriptionPaymentMethodQueryRepository,
  SUBSCRIPTION_PAYMENT_METHOD_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription-payment-method.repository.interface';
import {
  BILLING_ADAPTER,
  IBillingAdapter,
} from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { Money } from '@src/domain/value-objects/money.vo';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { DateTimeManager } from '@common/utils';

const RENEWAL_LABEL = 'Abonelik yenileme';
const BILLING_PERIOD_MONTHS = 1;

@CommandHandler(ProcessSubscriptionRenewalsCommand)
export class ProcessSubscriptionRenewalsHandler
  implements ICommandHandler<ProcessSubscriptionRenewalsCommand, void>
{
  private readonly logger = new Logger(ProcessSubscriptionRenewalsHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    @Inject(SUBSCRIPTION_PAYMENT_METHOD_QUERY_REPOSITORY)
    private readonly paymentMethodQueryRepo: ISubscriptionPaymentMethodQueryRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: IBillingAdapter,
    private readonly txManager: TransactionManager
  ) {}

  async execute(): Promise<void> {
    const due = await this.subscriptionQueryRepo.findDueForRenewal(new Date());
    if (due.length === 0) return;

    this.logger.log(`Yenileme: ${due.length} dönem-sonu abonelik işleniyor`);

    for (const subscription of due) {
      // Her abonelik ayrı transaction — biri hata verirse diğerleri etkilenmez.
      await this.txManager
        .outboxRun(() => this.processOne(subscription))
        .catch((err) =>
          this.logger.error(
            `Yenileme hatası (subscriptionId: ${subscription.id.value})`,
            err
          )
        );
    }
  }

  private async processOne(subscription: Subscription): Promise<void> {
    if (subscription.cancelAtPeriodEnd) {
      subscription.cancel();
      await this.subscriptionCommandRepo.save(subscription);
      return;
    }

    const subscriptionId = subscription.id.value;
    const [savedCard, charge] = await Promise.all([
      this.paymentMethodQueryRepo.findBySubscriptionId(subscriptionId),
      this.subscriptionQueryRepo.findRenewalCharge(subscriptionId),
    ]);

    // Kayıtlı kart veya tahsil edilecek tutar yoksa otomatik çekim yapılamaz → PAST_DUE.
    if (!savedCard || !charge) {
      this.failRenewal(subscription);
      await this.subscriptionCommandRepo.save(subscription);
      return;
    }

    const amount = Money.fromTrusted(
      charge.amount,
      charge.currency as CurrencyType
    );

    const result = await this.billingAdapter.chargeSavedCard({
      organizationId: subscription.organizationId.value,
      amount,
      label: RENEWAL_LABEL,
      savedCard: {
        cardUserKey: savedCard.cardUserKey,
        cardToken: savedCard.cardToken,
      },
      buyer: {
        id: subscription.organizationId.value,
        name: savedCard.buyer.name,
        surname: savedCard.buyer.surname,
        email: savedCard.buyer.email,
        gsmNumber: savedCard.buyer.gsmNumber,
        ip: savedCard.buyer.ip,
        city: savedCard.buyer.city ?? undefined,
        address: savedCard.buyer.address ?? undefined,
      },
    });

    if (result.success && result.iyzicoPaymentId) {
      const periodStart = subscription.currentPeriodEnd ?? DateTimeManager.create();
      const periodEnd = DateTimeManager.addMonths(
        periodStart,
        BILLING_PERIOD_MONTHS
      );
      subscription.renew({
        periodStart,
        periodEnd,
        iyzicoPaymentId: result.iyzicoPaymentId,
        event: {
          action: LogAction.SUBSCRIPTION_RENEWED,
          type: LogType.INFO,
          source: LogSource.SYSTEM,
        },
      });
    } else {
      this.failRenewal(subscription, result.errorMessage);
    }

    await this.subscriptionCommandRepo.save(subscription);
  }

  private failRenewal(subscription: Subscription, errorMessage?: string): void {
    subscription.failPayment({
      action: LogAction.SUBSCRIPTION_PAYMENT_FAILED,
      type: LogType.WARNING,
      source: LogSource.SYSTEM,
      errorMessage,
    });
  }
}
