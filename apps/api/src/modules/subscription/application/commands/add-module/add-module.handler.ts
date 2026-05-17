import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AddModuleCommand } from './add-module.command';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPO_TOKEN,
} from '@modules/subscription/domain/repositories/subscription.repository.interface';
import {
  BILLING_ADAPTER_TOKEN,
  IBillingAdapter,
} from '@modules/subscription/infrastructure/adapters/billing-adapter.interface';

export interface AddModuleResult {
  checkoutUrl: string;
}

@CommandHandler(AddModuleCommand)
export class AddModuleHandler
  implements ICommandHandler<AddModuleCommand, AddModuleResult>
{
  constructor(
    @Inject(SUBSCRIPTION_REPO_TOKEN)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(BILLING_ADAPTER_TOKEN)
    private readonly billingAdapter: IBillingAdapter
  ) {}

  async execute(command: AddModuleCommand): Promise<AddModuleResult> {
    const { organizationId, moduleKey, buyer, externalPriceId } = command;

    if (!buyer) {
      throw new BadRequestException('Buyer info is required to add a module');
    }

    const subscription =
      await this.subscriptionRepo.findByOrganizationId(organizationId);
    if (!subscription) {
      throw new NotFoundException(
        'No subscription found for this organization'
      );
    }

    const module = await this.subscriptionRepo.findModuleByKey(moduleKey);
    if (!module) {
      throw new NotFoundException(`Module "${moduleKey}" not found`);
    }

    if (!module.isActive) {
      throw new UnprocessableEntityException(
        `Module "${moduleKey}" is not available`
      );
    }

    const { checkoutUrl, conversationId } =
      await this.billingAdapter.initializePayment({
        organizationId,
        amount: Number(module.monthlyPrice),
        label: module.name,
        buyer,
      });

    await this.subscriptionRepo.addItem({
      subscriptionId: subscription.id,
      moduleId: module.id,
      priceAtPurchase: module.monthlyPrice,
      externalPriceId: externalPriceId ?? conversationId,
    });

    return { checkoutUrl };
  }
}
