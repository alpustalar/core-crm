import { FindClinicIdByProviderIdHandler } from './find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.handler';
import { FindClinicIdByPatientIdHandler } from './find-clinic-id-by-patient-id/find-clinic-id-by-patient-id.handler';
import { GetClinicScheduleHandler } from './get-clinic-schedule/get-clinic-schedule.handler';
import { FindManyByOrganizationIdHandler } from './find-many-by-organization-id/find-many-by-organization-id.handler';
import { Module } from '@nestjs/common';
import { FindClinicAvailabilityByDayHandler } from './find-clinic-availability-by-day/find-clinic-availability-by-day.handler';

import { GetClinicTimezoneHandler } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.handler';
import { GetClinicCurrencyHandler } from '@modules/organization/clinic/application/queries/get-clinic-currency/get-clinic-currency.handler';
import { GetClinicOrganizationIdHandler } from '@modules/organization/clinic/application/queries/get-clinic-organization-id/get-clinic-organization-id.handler';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { AssertClinicCanBookHandler } from '@modules/organization/clinic/application/queries/assert-clinic-can-book/assert-clinic-can-book.handler';
import { AssertTimeWithinClinicHoursHandler } from '@modules/organization/clinic/application/queries/assert-time-within-clinic-hours/assert-time-within-clinic-hours.handler';
import { GetClinicAppointmentSettingsHandler } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.handler';
import { ClinicCacheService } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.service';
import { CLINIC_CACHE_SERVICE } from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';

const QueryHandlers = [
  FindClinicIdByProviderIdHandler,
  FindClinicIdByPatientIdHandler,
  GetClinicScheduleHandler,
  FindManyByOrganizationIdHandler,
  FindClinicAvailabilityByDayHandler,
  AssertClinicCanBookHandler,
  AssertTimeWithinClinicHoursHandler,
  GetClinicTimezoneHandler,
  GetClinicCurrencyHandler,
  GetClinicOrganizationIdHandler,
  GetClinicAppointmentSettingsHandler,
];

@Module({
  imports: [ClinicRepositoriesModule],
  providers: [
    ...QueryHandlers,
    { provide: CLINIC_CACHE_SERVICE, useClass: ClinicCacheService },
  ],
  exports: [...QueryHandlers],
})
export class ClinicQueryModule {}
