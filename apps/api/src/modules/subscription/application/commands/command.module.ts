import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IyzicoModule } from '@src/infrastructure/payment/providers/iyzico/iyzico.module';
import { SubscribeToPlanHandler } from './subscribe-to-plan/subscribe-to-plan.handler';
import { AddModuleHandler } from './add-module/add-module.handler';
import { HandleSubscriptionCallbackHandler } from './handle-subscription-callback/handle-subscription-callback.handler';
import { SUBSCRIPTION_REPO_TOKEN } from '@modules/subscription/domain/repositories/subscription.repository.interface';
import { SubscriptionRepository } from '@modules/subscription/infrastructure/persistence/prisma/repositories/subscription.repository';
import { BILLING_ADAPTER_TOKEN } from '@modules/subscription/infrastructure/adapters/billing-adapter.interface';
import { IyzicoBillingAdapter } from '@modules/subscription/infrastructure/adapters/iyzico-billing.adapter';

const CommandHandlers = [
  SubscribeToPlanHandler,
  AddModuleHandler,
  HandleSubscriptionCallbackHandler,
];

@Module({
  imports: [CqrsModule, IyzicoModule],
  providers: [
    ...CommandHandlers,
    {
      provide: SUBSCRIPTION_REPO_TOKEN,
      useClass: SubscriptionRepository,
    },
    {
      provide: BILLING_ADAPTER_TOKEN,
      useClass: IyzicoBillingAdapter,
    },
  ],
  exports: [...CommandHandlers],
})
export class SubscriptionCommandModule {}
