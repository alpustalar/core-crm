import { Module } from '@nestjs/common';
import { CLINIC_AVAILABILITY_QUERY_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';
import { ClinicAvailabilityQueryRepository } from './clinic-availability.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_AVAILABILITY_QUERY_REPOSITORY,
      useClass: ClinicAvailabilityQueryRepository,
    },
  ],
  exports: [CLINIC_AVAILABILITY_QUERY_REPOSITORY],
})
export class ClinicAvailabilityRepositoryModule {}
