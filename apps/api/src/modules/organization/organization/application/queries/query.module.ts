import { FindOrganizationIdByClinicIdHandler } from './find-organization-id-by-clinic-id/find-organization-id-by-clinic-id.handler';
import { Module } from '@nestjs/common';
import { GetOrganizationBillingTargetHandler } from './get-organization-billing-target/get-organization-billing-target.handler';
import { OrganizationRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization/organization.repository.module';
import { OrganizationFinanceSettingsRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization-finance-settings/organization-finance-settings.repository.module';
import { ORGANIZATION_CACHE_SERVICE } from '@modules/organization/organization/domain/interfaces/organization-cache.service.interface';
import { OrganizationCacheService } from '@modules/organization/organization/infrastructure/cache/organization-cache.service';
import { FindByIdHandler } from '@modules/organization/organization/application/queries/find-by-id/find-by-id.handler';

const QueryHandlers = [
  FindOrganizationIdByClinicIdHandler,
  FindByIdHandler,
  GetOrganizationBillingTargetHandler,
];

@Module({
  imports: [
    OrganizationRepositoryModule,
    OrganizationFinanceSettingsRepositoryModule,
  ],
  providers: [
    ...QueryHandlers,
    {
      provide: ORGANIZATION_CACHE_SERVICE,
      useClass: OrganizationCacheService,
    },
  ],
  exports: [...QueryHandlers],
})
export class OrganizationQueryModule {}
