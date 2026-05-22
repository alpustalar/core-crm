import { GetClinicScheduleHandler } from './get-clinic-schedule/get-clinic-schedule.handler';
import { FindManyByOrganizationIdHandler } from './find-many-by-organization-id/find-many-by-organization-id.handler';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FindClinicAvailabilityByDayHandler } from './find-clinic-availability-by-day/find-clinic-availability-by-day.handler';
import { ClinicRepositoryModule } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic/clinic.repository.module';
import { ClinicAvailabilityRepositoryModule } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic-availability/clinic-availability.repository.module';
import { AssertClinicCanBookOrThrowHandler } from './assert-clinic-can-book-or-throw/assert-clinic-can-book-or-throw.handler';
import { ValidateTimeWithinClinicHoursOrThrowHandler } from './validate-time-within-clinic-hours/validate-time-within-clinic-hours.handler';
import {
  CLINIC_AVAILABILITY_DOMAIN_SERVICE,
} from '@modules/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import { ClinicAvailabilityDomainService } from '@modules/clinic/domain/services/clinic-availability.domain-service';

const QueryHandlers = [
  GetClinicScheduleHandler,
  FindManyByOrganizationIdHandler,
  FindClinicAvailabilityByDayHandler,
  AssertClinicCanBookOrThrowHandler,
  ValidateTimeWithinClinicHoursOrThrowHandler,
];

@Module({
  imports: [CqrsModule, ClinicRepositoryModule, ClinicAvailabilityRepositoryModule],
  providers: [
    ...QueryHandlers,
    { provide: CLINIC_AVAILABILITY_DOMAIN_SERVICE, useClass: ClinicAvailabilityDomainService },
  ],
  exports: [...QueryHandlers],
})
export class ClinicQueryModule {}
