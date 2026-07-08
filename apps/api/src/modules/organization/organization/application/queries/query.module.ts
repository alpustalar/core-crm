import { Module } from '@nestjs/common';
import { FindHandler } from './find/find.handler';
import { GetOrganizationBillingTargetHandler } from './get-organization-billing-target/get-organization-billing-target.handler';
import { OrganizationRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization/organization.repository.module';
import { OrganizationFinanceSettingsRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization-finance-settings/organization-finance-settings.repository.module';

const QueryHandlers = [FindHandler, GetOrganizationBillingTargetHandler];

@Module({
  imports: [
    OrganizationRepositoryModule,
    OrganizationFinanceSettingsRepositoryModule,
  ],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class OrganizationQueryModule {}
