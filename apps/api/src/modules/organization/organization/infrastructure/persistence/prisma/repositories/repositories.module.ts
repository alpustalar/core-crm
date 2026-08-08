import { Module } from '@nestjs/common';
import { OrganizationFinanceSettingsRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization-finance-settings/organization-finance-settings.repository.module';
import { OrganizationRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization/organization.repository.module';

const RepositoriesModules = [
  OrganizationFinanceSettingsRepositoryModule,
  OrganizationRepositoryModule,
];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class OrganizationRepositoriesModule {}
