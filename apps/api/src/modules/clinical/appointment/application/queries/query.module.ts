import { GetProviderCalendarHandler } from './get-provider-calendar/get-provider-calendar.handler';
import { GetProviderAvailabilityHandler } from './get-provider-availability/get-provider-availability.handler';
import { GetPatientAppointmentsHandler } from './get-patient-appointments/get-patient-appointments.handler';
import { GetOrganizationAppointmentsHandler } from './get-organization-appointments/get-organization-appointments.handler';
import { GetAppointmentDetailHandler } from './get-appointment-detail/get-appointment-detail.handler';
import { GetClinicAppointmentsHandler } from './get-clinic-appointments/get-clinic-appointments.handler';
import { Module } from '@nestjs/common';
import { GetActionRequiredHandler } from './get-action-required/get-action-required.handler';
import { GetProviderOpenSlotsHandler } from './get-provider-open-slots/get-provider-open-slots.handler';
import { GetClinicOpenSlotsHandler } from './get-clinic-open-slots/get-clinic-open-slots.handler';
import { GetClinicCalendarHandler } from './get-clinic-calendar/get-clinic-calendar.handler';
import { CheckAppointmentConflictsHandler } from './check-appointment-conflicts/check-appointment-conflicts.handler';
import { GetWaitingRoomHandler } from './get-waiting-room/get-waiting-room.handler';
import { SearchClinicAppointmentsHandler } from './search-clinic-appointments/search-clinic-appointments.handler';
import { GetUpcomingRemindersHandler } from './get-upcoming-reminders/get-upcoming-reminders.handler';
import { GetClinicDailySummaryHandler } from './get-clinic-daily-summary/get-clinic-daily-summary.handler';
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
  GetClinicOpenSlotsHandler,
  GetClinicCalendarHandler,
  CheckAppointmentConflictsHandler,
  GetWaitingRoomHandler,
  SearchClinicAppointmentsHandler,
  GetUpcomingRemindersHandler,
  GetClinicDailySummaryHandler,
];

@Module({
  imports: [AppointmentRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class AppointmentQueryModule {}
