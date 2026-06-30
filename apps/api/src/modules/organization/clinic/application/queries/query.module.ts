import { GetClinicScheduleHandler } from './get-clinic-schedule/get-clinic-schedule.handler';
import { FindManyByOrganizationIdHandler } from './find-many-by-organization-id/find-many-by-organization-id.handler';
import { Module } from '@nestjs/common';
import { FindClinicAvailabilityByDayHandler } from './find-clinic-availability-by-day/find-clinic-availability-by-day.handler';

import { CLINIC_AVAILABILITY_DOMAIN_SERVICE } from '@modules/organization/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import { ClinicAvailabilityDomainService } from '@modules/organization/clinic/domain/services/clinic-availability.domain-service';
import { GetClinicTimezoneHandler } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.handler';
import { GetClinicCurrencyHandler } from '@modules/organization/clinic/application/queries/get-clinic-currency/get-clinic-currency.handler';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { AssertClinicCanBookHandler } from '@modules/organization/clinic/application/queries/assert-clinic-can-book/assert-clinic-can-book.handler';
import { AssertTimeWithinClinicHoursHandler } from '@modules/organization/clinic/application/queries/assert-time-within-clinic-hours/assert-time-within-clinic-hours.handler';

const QueryHandlers = [
  GetClinicScheduleHandler,
  FindManyByOrganizationIdHandler,
  FindClinicAvailabilityByDayHandler,
  AssertClinicCanBookHandler,
  AssertTimeWithinClinicHoursHandler,
  GetClinicTimezoneHandler,
  GetClinicCurrencyHandler,
];

@Module({
  imports: [ClinicRepositoriesModule],
  providers: [
    ...QueryHandlers,
    {
      provide: CLINIC_AVAILABILITY_DOMAIN_SERVICE,
      useClass: ClinicAvailabilityDomainService,
    },
  ],
  exports: [...QueryHandlers],
})
export class ClinicQueryModule {}
