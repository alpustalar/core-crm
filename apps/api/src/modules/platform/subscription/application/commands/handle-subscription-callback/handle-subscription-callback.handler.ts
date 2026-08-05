import {
  ISubscriptionCommandRepository,
  ISubscriptionQueryRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import {
  ISubscriptionPaymentMethodCommandRepository,
  SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription-payment-method.repository.interface';
import {
  BILLING_ADAPTER,
  CapturedSavedCard,
  IBillingAdapter,
} from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { DateTimeManager } from '@common/utils';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { HandleSubscriptionCallbackCommand } from './handle-subscription-callback.command';

const BILLING_PERIOD_MONTHS = 1;

@CommandHandler(HandleSubscriptionCallbackCommand)
export class HandleSubscriptionCallbackHandler implements ICommandHandler<
  HandleSubscriptionCallbackCommand,
  void
> {
  private readonly logger = new Logger(HandleSubscriptionCallbackHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY)
    private readonly paymentMethodCommandRepo: ISubscriptionPaymentMethodCommandRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: IBillingAdapter,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: HandleSubscriptionCallbackCommand): Promise<void> {
    const { token, conversationId } = command;

    const subscription =
      await this.subscriptionQueryRepo.findByExternalId(conversationId);

    if (!subscription) {
      this.logger.warn(
        `Subscription callback: no subscription found for conversationId=${conversationId}`
      );
      throw new NotFoundException(
        `Subscription not found for conversationId=${conversationId}`
      );
    }

    const result = await this.billingAdapter.handlePaymentResult(token);

    await this.txManager.outboxRun(async () => {
      if (result.success && result.iyzicoPaymentId) {
        subscription.confirmPayment(result.iyzicoPaymentId, {
          action: LogAction.SUBSCRIPTION_ACTIVATED,
          type: LogType.INFO,
          source: LogSource.SYSTEM,
        });
        // İlk başarılı ödeme fatura dönemini başlatır → yenileme günü bu tarihten hesaplanır.
        this.startInitialPeriod(subscription);
        await this.subscriptionCommandRepo.update(subscription);

        // Müşteri kartını sakladıysa sonraki dönemler için otomatik tahsilat yöntemini kaydet.
        if (result.savedCard) {
          await this.persistSavedCard(subscription.id.value, result.savedCard);
        }
      } else {
        subscription.failPayment({
          action: LogAction.SUBSCRIPTION_PAYMENT_FAILED,
          type: LogType.WARNING,
          source: LogSource.SYSTEM,
          errorMessage: result.errorMessage,
        });
        await this.subscriptionCommandRepo.update(subscription);
      }
    });
  }

  private startInitialPeriod(subscription: Subscription): void {
    const start = DateTimeManager.create();
    const end = DateTimeManager.addMonths(start, BILLING_PERIOD_MONTHS);
    subscription.startNewPeriod(start, end);
  }

  private async persistSavedCard(
    subscriptionId: string,
    savedCard: CapturedSavedCard
  ): Promise<void> {
    await this.paymentMethodCommandRepo.upsertBySubscriptionId({
      subscriptionId,
      cardUserKey: savedCard.cardUserKey,
      cardToken: savedCard.cardToken,
      maskedNumber: savedCard.maskedNumber,
      cardAssociation: savedCard.cardAssociation,
      cardFamily: savedCard.cardFamily,
      buyerName: savedCard.buyer.name,
      buyerSurname: savedCard.buyer.surname,
      buyerEmail: savedCard.buyer.email,
      buyerGsmNumber: savedCard.buyer.gsmNumber,
      buyerIp: savedCard.buyer.ip,
      buyerCity: savedCard.buyer.city,
      buyerAddress: savedCard.buyer.address,
    });
  }
}
