import { Module } from '@nestjs/common';
import { SubscriptionRepositoriesModule } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/repositories.module';
import { SubscriptionEventModule } from '@modules/platform/subscription/infrastructure/messaging/events/subscription-event.module';
import { SUBSCRIPTION_CACHE_SERVICE } from '@modules/platform/subscription/domain/interfaces/subscription-cache.service.interface';
import { SubscriptionCacheService } from '@modules/platform/subscription/infrastructure/cache/subscription-cache.service';

const SubscriptionInfrastructureModules = [
  SubscriptionRepositoriesModule,
  SubscriptionEventModule,
];

@Module({
  imports: [...SubscriptionInfrastructureModules],
  providers: [
    { provide: SUBSCRIPTION_CACHE_SERVICE, useClass: SubscriptionCacheService },
  ],
  exports: [...SubscriptionInfrastructureModules, SUBSCRIPTION_CACHE_SERVICE],
})
export class SubscriptionInfrastructureModule {}
