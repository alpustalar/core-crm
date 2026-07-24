import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddModuleCommand } from './add-module.command';
import {
  ISubscriptionQueryRepository,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import {
  BILLING_ADAPTER,
  IBillingAdapter,
} from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { Money } from '@src/domain/value-objects/money.vo';

import {
  ISubscriptionItemCommandRepository,
  SUBSCRIPTION_ITEM_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription-item.repository.interface';
import { SubscriptionItem } from '@modules/platform/subscription/domain/entities/subscription-item.entity';
import {
  SubscriptionBuyerRequiredException,
  SubscriptionModuleNotAvailableException,
  SubscriptionModuleNotFoundException,
  SubscriptionNotFoundException,
} from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';

export interface AddModuleResult {
  checkoutUrl: string;
}

@CommandHandler(AddModuleCommand)
export class AddModuleHandler
  implements ICommandHandler<AddModuleCommand, AddModuleResult>
{
  constructor(
    @Inject(SUBSCRIPTION_ITEM_COMMAND_REPOSITORY)
    private readonly subscriptionItemCommandRepo: ISubscriptionItemCommandRepository,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: IBillingAdapter
  ) {}

  async execute(command: AddModuleCommand): Promise<AddModuleResult> {
    const { organizationId, moduleKey, buyer, externalPriceId } =
      command.payload;

    if (!buyer) {
      throw new SubscriptionBuyerRequiredException();
    }

    const subscription =
      await this.subscriptionQueryRepo.findByOrganizationId(organizationId);
    if (!subscription) {
      throw new SubscriptionNotFoundException();
    }

    const module = await this.subscriptionQueryRepo.findModuleByKey(moduleKey);

    if (!module) {
      throw new SubscriptionModuleNotFoundException(moduleKey);
    }
    if (!module.isActive) {
      throw new SubscriptionModuleNotAvailableException(moduleKey);
    }

    const price = Money.create(module.monthlyPrice, module.currency).orThrow();

    const { checkoutUrl, conversationId } =
      await this.billingAdapter.initializePayment({
        organizationId,
        amount: price,
        label: module.name,
        buyer,
      });

    const subscriptionItem = SubscriptionItem.create({
      subscriptionId: subscription.id, // read-model → düz string id
      moduleId: module.id,
      priceAtPurchase: price,
      externalPriceId: externalPriceId ?? conversationId,
    });

    await this.subscriptionItemCommandRepo.create(subscriptionItem);

    return { checkoutUrl };
  }
}
