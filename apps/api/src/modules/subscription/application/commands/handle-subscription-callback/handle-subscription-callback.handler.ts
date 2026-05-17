import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { SubStatus } from '@prisma/client';
import { HandleSubscriptionCallbackCommand } from './handle-subscription-callback.command';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPO_TOKEN,
} from '@modules/subscription/domain/repositories/subscription.repository.interface';
import {
  BILLING_ADAPTER_TOKEN,
  IBillingAdapter,
} from '@modules/subscription/infrastructure/adapters/billing-adapter.interface';

@CommandHandler(HandleSubscriptionCallbackCommand)
export class HandleSubscriptionCallbackHandler
  implements ICommandHandler<HandleSubscriptionCallbackCommand, void>
{
  private readonly logger = new Logger(HandleSubscriptionCallbackHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPO_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(BILLING_ADAPTER_TOKEN)
    private readonly billingAdapter: IBillingAdapter
  ) {}

  async execute(command: HandleSubscriptionCallbackCommand): Promise<void> {
    const { token, conversationId } = command;

    // conversationId, ödeme başlatılırken Subscription.externalId'e yazılmıştı
    const subscription =
      await this.subscriptionRepo.findByExternalId(conversationId);

    if (!subscription) {
      this.logger.warn(
        `Subscription callback: no subscription found for conversationId=${conversationId}`
      );
      throw new NotFoundException(
        `Subscription not found for conversationId=${conversationId}`
      );
    }

    const result = await this.billingAdapter.handlePaymentResult(token);

    if (result.success && result.iyzicoPaymentId) {
      // externalId'yi geçici conversationId'den kalıcı iyzicoPaymentId'ye güncelle
      await this.subscriptionRepo.updateExternalId(
        subscription.id,
        result.iyzicoPaymentId
      );
      await this.subscriptionRepo.updateStatus(
        subscription.id,
        SubStatus.ACTIVE
      );

      this.logger.log(
        `Subscription activated: id=${subscription.id}, iyzicoPaymentId=${result.iyzicoPaymentId}`
      );
    } else {
      await this.subscriptionRepo.updateStatus(
        subscription.id,
        SubStatus.PAST_DUE
      );

      this.logger.warn(`Subscription payment failed: id=${subscription.id}`, {
        errorMessage: result.errorMessage,
      });
    }
  }
}
