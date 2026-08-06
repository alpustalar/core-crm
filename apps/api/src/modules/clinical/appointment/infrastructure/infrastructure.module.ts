import { Module } from '@nestjs/common';
import { AppointmentRepositoriesModule } from '@modules/clinical/appointment/infrastructure/persistence/prisma/repositories/repositories.module';
import { AppointmentEventModule } from '@modules/clinical/appointment/infrastructure/events/appointment-event.module';
import { APPOINTMENT_CACHE_SERVICE } from '@modules/clinical/appointment/infrastructure/cache/appointment-cache.service.interface';
import { AppointmentCacheService } from '@modules/clinical/appointment/infrastructure/cache/appointment-cache.service';

const InfrastructureModules = [
  AppointmentRepositoriesModule,
  AppointmentEventModule,
];

@Module({
  imports: [...InfrastructureModules],
  providers: [
    { provide: APPOINTMENT_CACHE_SERVICE, useClass: AppointmentCacheService },
  ],
  exports: [...InfrastructureModules, APPOINTMENT_CACHE_SERVICE],
})
export class AppointmentInfrastructureModule {}
