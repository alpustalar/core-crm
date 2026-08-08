import { Module } from '@nestjs/common';
import { ORGANIZATION_CACHE_SERVICE } from '@modules/organization/organization/domain/interfaces/organization-cache.service.interface';
import { OrganizationCacheService } from '@modules/organization/organization/infrastructure/cache/organization-cache.service';
import { OrganizationEventModule } from '@modules/organization/organization/infrastructure/messaging/events/organization-event.module';
import { OrganizationRepositoriesModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/repositories.module';
import { OrganizationQueueModule } from '@modules/organization/organization/infrastructure/messaging/queue/queue.module';

const InfrastructureModules = [
  OrganizationEventModule,
  OrganizationRepositoriesModule,
  OrganizationQueueModule,
];

@Module({
  imports: [...InfrastructureModules],
  providers: [
    { provide: ORGANIZATION_CACHE_SERVICE, useClass: OrganizationCacheService },
  ],
  exports: [ORGANIZATION_CACHE_SERVICE, ...InfrastructureModules],
})
export class OrganizationInfrastructureModule {}
