import { Module } from '@nestjs/common';
import { OrganizationFinanceSettingsCommandRepository } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization-finance-settings/organization-finance-settings.command.repository';
import { OrganizationFinanceSettingsQueryRepository } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization-finance-settings/organization-finance-settings.query.repository';
import { ORGANIZATION_FINANCE_SETTINGS_COMMAND_REPOSITORY } from '@modules/organization/organization/domain/repositories/organization-finance-settings/organization-finance-settings.command.repository';
import { ORGANIZATION_FINANCE_SETTINGS_QUERY_REPOSITORY } from '@modules/organization/organization/domain/repositories/organization-finance-settings/organization-finance-settings.query.repository';

@Module({
  providers: [
    {
      provide: ORGANIZATION_FINANCE_SETTINGS_COMMAND_REPOSITORY,
      useClass: OrganizationFinanceSettingsCommandRepository,
    },
    {
      provide: ORGANIZATION_FINANCE_SETTINGS_QUERY_REPOSITORY,
      useClass: OrganizationFinanceSettingsQueryRepository,
    },
  ],
  exports: [
    ORGANIZATION_FINANCE_SETTINGS_COMMAND_REPOSITORY,
    ORGANIZATION_FINANCE_SETTINGS_QUERY_REPOSITORY,
  ],
})
export class OrganizationFinanceSettingsRepositoryModule {}
