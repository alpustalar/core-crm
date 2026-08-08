import { Module } from '@nestjs/common';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { ClinicEventModule } from '@modules/organization/clinic/infrastructure/messaging/events/clinic-event.module';
import { CLINIC_CACHE_SERVICE } from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import { ClinicCacheService } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.service';

const ClinicInfrastructureModules = [
  ClinicRepositoriesModule,
  ClinicEventModule,
];

@Module({
  imports: [...ClinicInfrastructureModules],
  providers: [{ provide: CLINIC_CACHE_SERVICE, useClass: ClinicCacheService }],
  exports: [...ClinicInfrastructureModules, CLINIC_CACHE_SERVICE],
})
export class ClinicInfrastructureModule {}
