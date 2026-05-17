import { GetClinicScheduleHandler } from './get-clinic-schedule/get-clinic-schedule.handler';
import { FindManyByOrganizationIdHandler } from './find-many-by-organization-id/find-many-by-organization-id.handler';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  FindClinicAvailabilityByDayHandler
} from './find-clinic-availability-by-day/find-clinic-availability-by-day.handler';
import {
  CLINIC_AVAILABILITY_REPO_TOKEN
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import {
  ClinicAvailabilityRepository
} from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic-availability.repository';
import {
  CLINIC_REPO_TOKEN
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import {
  ClinicRepository
} from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';

const QueryHandlers = [
  GetClinicScheduleHandler,
  FindManyByOrganizationIdHandler,
  FindClinicAvailabilityByDayHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    ...QueryHandlers,
    {
      provide: CLINIC_REPO_TOKEN,
      useClass: ClinicRepository,
    },
    {
      provide: CLINIC_AVAILABILITY_REPO_TOKEN,
      useClass: ClinicAvailabilityRepository,
    },
  ],
  exports: [...QueryHandlers],
})
export class ClinicQueryModule {}
