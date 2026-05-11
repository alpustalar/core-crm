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
  GetProviderAvailabilityCalendarUseCase,
  GetProviderCalendarUseCase,
} from '@modules/appointment/application/use-cases/queries';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { AppointmentSlotService } from '@modules/appointment/domain/services/appointment-slot.service';
import { AppointmentRepository } from '@modules/appointment/infrastructure/persistence/prisma/repositories';
import { PatientModule } from '@modules/patient/patient.module';
import { AuditLogModule } from '@modules/audit-log/audit-log.module';
import { APPOINTMENT_REPO_TOKEN } from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { ProviderModule } from '@modules/provider/provider.module';
import { PolicyModule } from '@modules/policy/policy.module';

const UseCases = [
  BookAppointmentUseCase,
  ScheduleAppointmentUseCase,
  StaffRescheduleUseCase,
  CancelAppointmentUseCase,
  ConfirmAppointmentUseCase,
  CompleteAppointmentUseCase,
  MarkNoShowUseCase,
  SoftDeleteAppointmentsByClinicIdUseCase,
  SoftDeleteAppointmentsByOrganizationIdUseCase,
  GetAllAppointmentsUseCase,
  GetAppointmentDetailUseCase,
  GetProviderCalendarUseCase,
  GetProviderAvailabilityCalendarUseCase,
  GetActionRequiredUseCase,
  GetPatientAppointmentsUseCase,
  GetOrganizationAppointmentsUseCase,
];

@Module({
  imports: [
    PatientModule,
    AuditLogModule,
    ClinicModule,
    ProviderModule,
    PolicyModule,
  ],
  providers: [
    ...UseCases,
    { provide: APPOINTMENT_REPO_TOKEN, useClass: AppointmentRepository },
    AppointmentChecker,
    AppointmentSlotService,
  ],
  exports: [...UseCases],
})
export class AppointmentUseCaseModule {}
