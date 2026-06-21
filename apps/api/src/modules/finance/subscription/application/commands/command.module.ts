import { Module } from '@nestjs/common';
import { SubscribeToPlanHandler } from './subscribe-to-plan/subscribe-to-plan.handler';
import { AddModuleHandler } from './add-module/add-module.handler';
import { HandleSubscriptionCallbackHandler } from './handle-subscription-callback/handle-subscription-callback.handler';
import { BILLING_ADAPTER } from '@modules/finance/subscription/infrastructure/adapters/billing-adapter.interface';
import { IyzicoBillingAdapter } from '@modules/finance/subscription/infrastructure/adapters/iyzico-billing.adapter';
import { SubscriptionRepositoryModule } from '@modules/finance/subscription/infrastructure/persistence/prisma/repositories/subscription.repository.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';

const CommandHandlers = [
  SubscribeToPlanHandler,
  AddModuleHandler,
  HandleSubscriptionCallbackHandler,
];

@Module({
  imports: [IyzicoModule, SubscriptionRepositoryModule, PrismaModule],
  providers: [
    ...CommandHandlers,
    { provide: BILLING_ADAPTER, useClass: IyzicoBillingAdapter },
  ],
  exports: [...CommandHandlers],
})
export class SubscriptionCommandModule {}
