import { Module } from '@nestjs/common';
import { EntitlementCacheInvalidationListener } from './listeners/entitlement-cache-invalidation.listener';

@Module({
  providers: [EntitlementCacheInvalidationListener],
})
export class SubscriptionEventModule {}
