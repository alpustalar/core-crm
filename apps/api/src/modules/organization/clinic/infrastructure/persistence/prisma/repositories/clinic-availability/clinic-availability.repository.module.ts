import { Module } from '@nestjs/common';
import { ClinicAvailabilityQueryRepository } from './clinic-availability.query.repository';
import { ClinicAvailabilityCommandRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-availability/clinic-availability.command.repository';
import { CLINIC_AVAILABILITY_QUERY_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic-availability/clinic-availability.query.repository.interface';
import { CLINIC_AVAILABILITY_COMMAND_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic-availability/clinic-availability.command.repository.interface';

@Module({
  providers: [
    {
      provide: CLINIC_AVAILABILITY_QUERY_REPOSITORY,
      useClass: ClinicAvailabilityQueryRepository,
    },
    {
      provide: CLINIC_AVAILABILITY_COMMAND_REPOSITORY,
      useClass: ClinicAvailabilityCommandRepository,
    },
  ],
  exports: [
    CLINIC_AVAILABILITY_QUERY_REPOSITORY,
    CLINIC_AVAILABILITY_COMMAND_REPOSITORY,
  ],
})
export class ClinicAvailabilityRepositoryModule {}
