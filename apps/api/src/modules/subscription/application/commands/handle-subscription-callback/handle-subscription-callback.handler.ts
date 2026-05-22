import {
  ISubscriptionCommandRepository,
  ISubscriptionQueryRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/subscription/domain/repositories/subscription.repository.interface';
import {
  BILLING_ADAPTER,
  IBillingAdapter,
} from '@modules/subscription/infrastructure/adapters/billing-adapter.interface';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { HandleSubscriptionCallbackCommand } from './handle-subscription-callback.command';

@CommandHandler(HandleSubscriptionCallbackCommand)
export class HandleSubscriptionCallbackHandler
  implements ICommandHandler<HandleSubscriptionCallbackCommand, void>
{
  private readonly logger = new Logger(HandleSubscriptionCallbackHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
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
      } else {
        subscription.failPayment({
          action: LogAction.SUBSCRIPTION_PAYMENT_FAILED,
          type: LogType.WARNING,
          source: LogSource.SYSTEM,
          errorMessage: result.errorMessage,
        });
      }

      await this.subscriptionCommandRepo.save(subscription);
    });
  }
}
