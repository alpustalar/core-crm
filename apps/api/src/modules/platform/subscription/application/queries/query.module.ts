import { Module } from '@nestjs/common';
import { GetActiveSubscriptionHandler } from './get-active-subscription/get-active-subscription.handler';
import { ListModulesHandler } from './list-modules/list-modules.handler';
import { ListPlansHandler } from './list-plans/list-plans.handler';
import { GetTenantEntitlementsHandler } from './get-tenant-entitlements/get-tenant-entitlements.handler';
import { SubscriptionRepositoriesModule } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [
  GetActiveSubscriptionHandler,
  ListModulesHandler,
  ListPlansHandler,
  GetTenantEntitlementsHandler,
];

@Module({
  imports: [SubscriptionRepositoriesModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class SubscriptionQueryModule {}
