import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { PlanId } from '@prisma/client';
import { SubscribeToPlanCommand } from './subscribe-to-plan.command';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPO_TOKEN,
} from '@modules/subscription/domain/repositories/subscription.repository.interface';
import {
  BILLING_ADAPTER_TOKEN,
  IBillingAdapter,
} from '@modules/subscription/infrastructure/adapters/billing-adapter.interface';

export interface SubscribeToPlanResult {
  subscriptionId: string;
  checkoutUrl: string | null; // null = FREE_TRIAL, ödeme gerekmez
}

@CommandHandler(SubscribeToPlanCommand)
export class SubscribeToPlanHandler
  implements ICommandHandler<SubscribeToPlanCommand, SubscribeToPlanResult>
{
  constructor(
    @Inject(SUBSCRIPTION_REPO_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(BILLING_ADAPTER_TOKEN)
    private readonly billingAdapter: IBillingAdapter
  ) {}

  async execute(
    command: SubscribeToPlanCommand
  ): Promise<SubscribeToPlanResult> {
    const {
      organizationId,
      planId,
      priceAtPurchase,
      buyer,
      externalPriceId,
    } = command;

    const alreadyExists =
      await this.subscriptionRepo.existsByOrganizationId(organizationId);
    if (alreadyExists) {
      throw new ConflictException(
        'Organization already has an active subscription'
      );
    }

    const isFreeTrial = planId === PlanId.FREE_TRIAL;

    if (!isFreeTrial && !buyer) {
      throw new BadRequestException(
        'Buyer info is required for paid plans'
      );
    }

    let checkoutUrl: string | null = null;
    let externalId: string | undefined;

    if (!isFreeTrial && buyer) {
      const result = await this.billingAdapter.initializePayment({
        organizationId,
        amount: Number(priceAtPurchase),
        label: `${planId} Plan`,
        buyer,
      });

      checkoutUrl = result.checkoutUrl;
      externalId = result.conversationId;
    }

    const subscription = await this.subscriptionRepo.create({
      organizationId,
      externalId,
    });

    await this.subscriptionRepo.addItem({
      subscriptionId: subscription.id,
      planId,
      priceAtPurchase,
      externalPriceId,
    });

    return { subscriptionId: subscription.id, checkoutUrl };
  }
}
