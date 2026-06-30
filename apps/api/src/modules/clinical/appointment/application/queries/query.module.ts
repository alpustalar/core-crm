import { GetProviderCalendarHandler } from './get-provider-calendar/get-provider-calendar.handler';
import { GetProviderAvailabilityHandler } from './get-provider-availability/get-provider-availability.handler';
import { GetPatientAppointmentsHandler } from './get-patient-appointments/get-patient-appointments.handler';
import { GetOrganizationAppointmentsHandler } from './get-organization-appointments/get-organization-appointments.handler';
import { GetAppointmentDetailHandler } from './get-appointment-detail/get-appointment-detail.handler';
import { GetClinicAppointmentsHandler } from './get-clinic-appointments/get-clinic-appointments.handler';
import { Module } from '@nestjs/common';
import { GetActionRequiredHandler } from './get-action-required/get-action-required.handler';
import { GetProviderOpenSlotsHandler } from './get-provider-open-slots/get-provider-open-slots.handler';
import { AppointmentRepositoryModule } from '@modules/clinical/appointment/infrastructure/persistence/prisma/repositories/appointment/appointment.repository.module';

const QueryHandlers = [
  GetProviderCalendarHandler,
  GetProviderAvailabilityHandler,
  GetPatientAppointmentsHandler,
  GetOrganizationAppointmentsHandler,
  GetAppointmentDetailHandler,
  GetClinicAppointmentsHandler,
  GetActionRequiredHandler,
  GetProviderOpenSlotsHandler,
];

@Module({
  imports: [AppointmentRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class AppointmentQueryModule {}
