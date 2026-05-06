import { Module } from '@nestjs/common';
import {
  BookAppointmentUseCase,
  CancelAppointmentUseCase,
  CompleteAppointmentUseCase,
  ConfirmAppointmentUseCase,
  MarkNoShowUseCase,
  ScheduleAppointmentUseCase,
  SoftDeleteAppointmentsByClinicIdUseCase,
  SoftDeleteAppointmentsByOrganizationIdUseCase,
  StaffRescheduleUseCase,
} from '@modules/appointment/application/use-cases/commands';
import {
  GetActionRequiredUseCase,
  GetAllAppointmentsUseCase,
  GetAppointmentDetailUseCase,
  GetOrganizationAppointmentsUseCase,
  GetPatientAppointmentsUseCase,
  GetProviderCalendarUseCase,
} from '@modules/appointment/application/use-cases/queries';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { AppointmentRepository } from '@modules/appointment/infrastructure/persistence/prisma/repositories';
import { PatientModule } from '@modules/patient/patient.module';
import { AuditLogModule } from '@modules/audit-log/audit-log.module';
import { PolicyFactory } from '@modules/policy/policy-factory';

const CommandUseCases = [
  BookAppointmentUseCase,
  ScheduleAppointmentUseCase,
  StaffRescheduleUseCase,
  CancelAppointmentUseCase,
  ConfirmAppointmentUseCase,
  CompleteAppointmentUseCase,
  MarkNoShowUseCase,
  SoftDeleteAppointmentsByClinicIdUseCase,
  SoftDeleteAppointmentsByOrganizationIdUseCase,
];

const QueryUseCases = [
  GetAllAppointmentsUseCase,
  GetAppointmentDetailUseCase,
  GetProviderCalendarUseCase,
  GetActionRequiredUseCase,
  GetPatientAppointmentsUseCase,
  GetOrganizationAppointmentsUseCase,
];

@Module({
  imports: [PatientModule, AuditLogModule],
  providers: [
    ...CommandUseCases,
    ...QueryUseCases,
    AppointmentChecker,
    AppointmentRepository,
    PolicyFactory,
  ],
  exports: [...CommandUseCases, ...QueryUseCases],
})
export class AppointmentUseCaseModule {}
