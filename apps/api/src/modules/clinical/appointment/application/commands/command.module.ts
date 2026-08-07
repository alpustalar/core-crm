import { StaffRescheduleHandler } from './staff-reschedule/staff-reschedule.handler';
import {
  SoftDeleteAppointmentsByOrganizationIdHandler
} from './soft-delete-appointments-by-organization-id/soft-delete-appointments-by-organization-id.handler';
import {
  SoftDeleteAppointmentsByClinicIdHandler
} from './soft-delete-appointments-by-clinic-id/soft-delete-appointments-by-clinic-id.handler';
import { ScheduleAppointmentHandler } from './schedule-appointment/schedule-appointment.handler';
import { MarkNoShowHandler } from './mark-no-show/mark-no-show.handler';
import { ConfirmAppointmentHandler } from './confirm-appointment/confirm-appointment.handler';
import { CompleteAppointmentHandler } from './complete-appointment/complete-appointment.handler';
import { CancelAppointmentHandler } from './cancel-appointment/cancel-appointment.handler';
import { PatientCancelAppointmentHandler } from './patient-cancel-appointment/patient-cancel-appointment.handler';
import { Module } from '@nestjs/common';
import { PatientBookAppointmentHandler } from './patient-book-appointment/patient-book-appointment.handler';
import { BookAppointmentByContactHandler } from './book-appointment-by-contact/book-appointment-by-contact.handler';
import { UpdateAppointmentDetailsHandler } from './update-appointment-details/update-appointment-details.handler';
import { CancelProviderDayHandler } from './cancel-provider-day/cancel-provider-day.handler';
import { CheckInAppointmentHandler } from './check-in-appointment/check-in-appointment.handler';
import { LockAppointmentSlotHandler } from './lock-appointment-slot/lock-appointment-slot.handler';
import { ReleaseAppointmentSlotHandler } from './release-appointment-slot/release-appointment-slot.handler';
import {
  ProcessAppointmentRemindersHandler
} from './process-appointment-reminders/process-appointment-reminders.handler';
import {
  AppointmentCheckerService
} from '@modules/clinical/appointment/domain/services/appointment-checker/appointment-checker.service';
import { ProviderDomainServicesModule } from '@modules/clinical/provider/domain/services/services.module';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';
import { AppointmentInfrastructureModule } from '@modules/clinical/appointment/infrastructure/infrastructure.module';
import { AppointmentDomainServicesModule } from '@modules/clinical/appointment/domain/services/services.module';

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
  PatientBookAppointmentHandler,
  BookAppointmentByContactHandler,
  UpdateAppointmentDetailsHandler,
  CancelProviderDayHandler,
  CheckInAppointmentHandler,
  LockAppointmentSlotHandler,
  ReleaseAppointmentSlotHandler,
  ProcessAppointmentRemindersHandler,
];

@Module({
  imports: [
    ProviderDomainServicesModule,
    ClinicDomainServicesModule,
    AppointmentDomainServicesModule,
    AppointmentInfrastructureModule,
  ],
  providers: [...CommandHandlers, AppointmentCheckerService],
  exports: [...CommandHandlers],
})
export class AppointmentCommandModule {}
