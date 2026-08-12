import { Module } from '@nestjs/common';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { ClinicEventModule } from '@modules/organization/clinic/infrastructure/messaging/events/clinic-event.module';
import { ClinicCacheModule } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.module';
import { CLINIC_CACHE_SERVICE } from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';

const ClinicInfrastructureModules = [
  ClinicRepositoriesModule,
  ClinicEventModule,
  ClinicCacheModule,
];

@Module({
  imports: [...ClinicInfrastructureModules],
  exports: [...ClinicInfrastructureModules, CLINIC_CACHE_SERVICE],
})
export class ClinicInfrastructureModule {}
