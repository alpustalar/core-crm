import { Module } from '@nestjs/common';
import { SubscriptionRepositoryModule } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/subscription/subscription.repository.module';
import { SubscriptionItemRepositoryModule } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/subscription-item/subscription-item.repository.module';
import { SubscriptionModuleRepositoryModule } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/module/module.repository.module';
import { PlanRepositoryModule } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/plan/plan.repository.module';
import { SubscriptionPaymentMethodRepositoryModule } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/subscription-payment-method/subscription-payment-method.repository.module';

@Module({
  imports: [
    SubscriptionRepositoryModule,
    SubscriptionItemRepositoryModule,
    SubscriptionModuleRepositoryModule,
    PlanRepositoryModule,
    SubscriptionPaymentMethodRepositoryModule,
  ],
  exports: [
    SubscriptionRepositoryModule,
    SubscriptionItemRepositoryModule,
    SubscriptionModuleRepositoryModule,
    PlanRepositoryModule,
    SubscriptionPaymentMethodRepositoryModule,
  ],
})
export class SubscriptionRepositoriesModule {}
