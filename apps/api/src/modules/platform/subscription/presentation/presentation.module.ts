import { Module } from '@nestjs/common';
import { SubscriptionController } from '@modules/platform/subscription/presentation/http/controllers/subscription.controller';
import { SubscriptionAdminController } from '@modules/platform/subscription/presentation/http/controllers/subscription-admin.controller';
import { ModuleEntitlementGuard } from '@modules/platform/subscription/presentation/guards/module-entitlement.guard';

@Module({
  controllers: [SubscriptionController, SubscriptionAdminController],
  providers: [ModuleEntitlementGuard],
  exports: [ModuleEntitlementGuard],
})
export class SubscriptionPresentationModule {}
