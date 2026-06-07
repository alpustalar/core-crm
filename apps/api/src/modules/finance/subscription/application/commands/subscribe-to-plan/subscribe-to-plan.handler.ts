import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { PlanId } from '@prisma/client';
import { SubscribeToPlanCommand } from './subscribe-to-plan.command';
import {
  ISubscriptionCommandRepository,
  ISubscriptionQueryRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/finance/subscription/domain/repositories/subscription.repository.interface';
import {
  BILLING_ADAPTER,
  IBillingAdapter,
} from '@modules/finance/subscription/infrastructure/adapters/billing-adapter.interface';

export interface SubscribeToPlanResult {
  subscriptionId: string;
  checkoutUrl: string | null; // null = FREE_TRIAL, ödeme gerekmez
}

@CommandHandler(SubscribeToPlanCommand)
export class SubscribeToPlanHandler
  implements ICommandHandler<SubscribeToPlanCommand, SubscribeToPlanResult>
{
  constructor(
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: IBillingAdapter
  ) {}

  async execute(
    command: SubscribeToPlanCommand
  ): Promise<SubscribeToPlanResult> {
    const { organizationId, planId, priceAtPurchase, buyer, externalPriceId } =
      command;

    const alreadyExists =
      await this.subscriptionQueryRepo.existsByOrganizationId(organizationId);
    if (alreadyExists) {
      throw new ConflictException(
        'Organization already has an active subscription'
      );
    }

    const isFreeTrial = planId === PlanId.FREE_TRIAL;

    if (!isFreeTrial && !buyer) {
      throw new BadRequestException('Buyer info is required for paid plans');
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

    const subscription = await this.subscriptionCommandRepo.create({
      organizationId,
      externalId,
    });

    await this.subscriptionCommandRepo.addItem({
      subscriptionId: subscription.id,
      planId,
      priceAtPurchase,
      externalPriceId,
    });

    return { subscriptionId: subscription.id, checkoutUrl };
  }
}
