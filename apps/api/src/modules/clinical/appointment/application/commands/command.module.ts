import { StaffRescheduleHandler } from './staff-reschedule/staff-reschedule.handler';
import { SoftDeleteAppointmentsByOrganizationIdHandler } from './soft-delete-appointments-by-organization-id/soft-delete-appointments-by-organization-id.handler';
import { SoftDeleteAppointmentsByClinicIdHandler } from './soft-delete-appointments-by-clinic-id/soft-delete-appointments-by-clinic-id.handler';
import { ScheduleAppointmentHandler } from './schedule-appointment/schedule-appointment.handler';
import { MarkNoShowHandler } from './mark-no-show/mark-no-show.handler';
import { ConfirmAppointmentHandler } from './confirm-appointment/confirm-appointment.handler';
import { CompleteAppointmentHandler } from './complete-appointment/complete-appointment.handler';
import { CancelAppointmentHandler } from './cancel-appointment/cancel-appointment.handler';
import { PatientCancelAppointmentHandler } from './patient-cancel-appointment/patient-cancel-appointment.handler';
import { Module } from '@nestjs/common';
import { BookAppointmentHandler } from './book-appointment/book-appointment.handler';
import { PatientBookAppointmentHandler } from './patient-book-appointment/patient-book-appointment.handler';
import { AppointmentEventModule } from '@modules/clinical/appointment/infrastructure/events/appointment-event.module';
import { PatientModule } from '@modules/crm/patient/patient.module';
import { AppointmentRepositoryModule } from '@modules/clinical/appointment/infrastructure/persistence/prisma/repositories/appointment/appointment.repository.module';
import { AppointmentCheckerService } from '@modules/clinical/appointment/domain/services/appointment-checker.service';

const CommandHandlers = [
  StaffRescheduleHandler,
  SoftDeleteAppointmentsByOrganizationIdHandler,
  SoftDeleteAppointmentsByClinicIdHandler,
  ScheduleAppointmentHandler,
  MarkNoShowHandler,
  ConfirmAppointmentHandler,
  CompleteAppointmentHandler,
  CancelAppointmentHandler,
  PatientCancelAppointmentHandler,
  BookAppointmentHandler,
  PatientBookAppointmentHandler,
];

@Module({
  imports: [AppointmentEventModule, PatientModule, AppointmentRepositoryModule],
  providers: [...CommandHandlers, AppointmentCheckerService],
  exports: [...CommandHandlers],
})
export class AppointmentCommandModule {}
