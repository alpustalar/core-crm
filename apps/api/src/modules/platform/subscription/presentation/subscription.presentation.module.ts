import { Module } from '@nestjs/common';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionAdminController } from './controllers/subscription-admin.controller';
import { SubscriptionCommandModule } from '@modules/platform/subscription/application/commands/command.module';
import { SubscriptionQueryModule } from '@modules/platform/subscription/application/queries/query.module';
import { ModuleEntitlementGuard } from './guards/module-entitlement.guard';

@Module({
  imports: [SubscriptionCommandModule, SubscriptionQueryModule],
  controllers: [SubscriptionController, SubscriptionAdminController],
  providers: [ModuleEntitlementGuard],
  exports: [ModuleEntitlementGuard],
})
export class SubscriptionPresentationModule {}
