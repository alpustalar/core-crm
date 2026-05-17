import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IyzicoModule } from '@src/infrastructure/payment/providers/iyzico/iyzico.module';
import { SubscriptionCommandModule } from '@modules/subscription/application/commands/command.module';
import { SubscriptionQueryModule } from '@modules/subscription/application/queries/query.module';
import { SubscriptionPresentationModule } from '@modules/subscription/presentation/subscription.presentation.module';
import { SUBSCRIPTION_REPO_TOKEN } from '@modules/subscription/domain/repositories/subscription.repository.interface';
import { SubscriptionRepository } from '@modules/subscription/infrastructure/persistence/prisma/repositories/subscription.repository';
import { SUBSCRIPTION_MODULE_API_TOKEN } from '@modules/subscription/domain/interfaces/subscription.module.api.interface';
import { SubscriptionModuleApi } from '@modules/subscription/subscription.module.api';
import { BILLING_ADAPTER_TOKEN } from '@modules/subscription/infrastructure/adapters/billing-adapter.interface';
import { IyzicoBillingAdapter } from '@modules/subscription/infrastructure/adapters/iyzico-billing.adapter';

@Module({
  imports: [
    CqrsModule,
    IyzicoModule,
    SubscriptionCommandModule,
    SubscriptionQueryModule,
    SubscriptionPresentationModule,
  ],
  providers: [
    {
      provide: SUBSCRIPTION_REPO_TOKEN,
      useClass: SubscriptionRepository,
    },
    {
      provide: BILLING_ADAPTER_TOKEN,
      useClass: IyzicoBillingAdapter,
    },
    {
      provide: SUBSCRIPTION_MODULE_API_TOKEN,
      useClass: SubscriptionModuleApi,
    },
  ],
  exports: [SUBSCRIPTION_MODULE_API_TOKEN],
})
export class SubscriptionModule {}
