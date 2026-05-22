import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IyzicoModule } from '@src/infrastructure/payment/providers/iyzico/iyzico.module';
import { SubscribeToPlanHandler } from './subscribe-to-plan/subscribe-to-plan.handler';
import { AddModuleHandler } from './add-module/add-module.handler';
import { HandleSubscriptionCallbackHandler } from './handle-subscription-callback/handle-subscription-callback.handler';
import { BILLING_ADAPTER } from '@modules/subscription/infrastructure/adapters/billing-adapter.interface';
import { IyzicoBillingAdapter } from '@modules/subscription/infrastructure/adapters/iyzico-billing.adapter';
import { SubscriptionRepositoryModule } from '@modules/subscription/infrastructure/persistence/prisma/repositories/subscription.repository.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';

const CommandHandlers = [
  SubscribeToPlanHandler,
  AddModuleHandler,
  HandleSubscriptionCallbackHandler,
];

@Module({
  imports: [CqrsModule, IyzicoModule, SubscriptionRepositoryModule, PrismaModule],
  providers: [
    ...CommandHandlers,
    { provide: BILLING_ADAPTER, useClass: IyzicoBillingAdapter },
  ],
  exports: [...CommandHandlers],
})
export class SubscriptionCommandModule {}
