import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AddModuleCommand } from './add-module.command';
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
import { Money } from '@src/domain/value-objects/money.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';

export interface AddModuleResult {
  checkoutUrl: string;
}

@CommandHandler(AddModuleCommand)
export class AddModuleHandler
  implements ICommandHandler<AddModuleCommand, AddModuleResult>
{
  constructor(
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: IBillingAdapter
  ) {}

  async execute(command: AddModuleCommand): Promise<AddModuleResult> {
    const { organizationId, moduleKey, buyer, externalPriceId } = command;

    if (!buyer) {
      throw new BadRequestException('Buyer info is required to add a module');
    }

    const subscription =
      await this.subscriptionQueryRepo.findByOrganizationId(organizationId);
    if (!subscription) {
      throw new NotFoundException(
        'No subscription found for this organization'
      );
    }

    const module = await this.subscriptionQueryRepo.findModuleByKey(moduleKey);
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
        amount: Money.create(module.monthlyPrice, Currency.enum.TRY).orThrow(),
        label: module.name,
        buyer,
      });

    await this.subscriptionCommandRepo.addItem({
      subscriptionId: subscription.id,
      moduleId: module.id,
      priceAtPurchase: Money.create(
        module.monthlyPrice,
        Currency.enum.TRY
      ).orThrow(),
      externalPriceId: externalPriceId ?? conversationId,
    });

    return { checkoutUrl };
  }
}
