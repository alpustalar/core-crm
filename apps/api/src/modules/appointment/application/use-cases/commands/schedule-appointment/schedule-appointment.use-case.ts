import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { PatientModuleApi } from '@modules/patient/patient-module.api';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ActorContext } from '@common/interfaces';
import { ScheduleAppointmentDto } from '@shared';
import { AuditLogService } from '@modules/audit-log/audit-log.service';

const DEFAULT_DURATION_MINUTES = 30;

interface ResolvePatientInput {
  patientId?: string;
  dtoPatientName?: string;
  dtoPatientPhone?: string;
  dtoPatientEmail?: string;
}

// Personel tarafından oluşturulan randevu akışı.
// clinicId actor'den gelir. patientId verilmişse PatientModuleApi üzerinden hasta bilgisi çekilir,
// verilmemişse DTO'daki patientName + patientPhone kullanılır (schema superRefine garantiler).
@Injectable()
export class ScheduleAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly patientModuleApi: PatientModuleApi,
    private readonly policyFactory: PolicyFactory,
    private readonly auditLog: AuditLogService
  ) {}

  async execute(dto: ScheduleAppointmentDto, actor: ActorContext) {
    if (!actor.clinicId) {
      throw new BadRequestException('Actor için klinik tanımlanmamış.');
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(actor.clinicId!),
        'Sadece kendi kliniğinizde randevu oluşturabilirsiniz.'
      )
      // TODO: event fırlat
      .orThrow();

    const {
      patientId,
      patientName: dtoPatientName,
      patientPhone: dtoPatientPhone,
      patientEmail: dtoPatientEmail,
      providerId,
      treatmentId,
      startTime,
      duration,
      notes,
    } = dto;

    const { patientName, patientPhone, patientEmail } =
      await this.resolvePatient({
        patientId,
        dtoPatientName,
        dtoPatientPhone,
        dtoPatientEmail,
      });

    const start = new Date(startTime);
    const endTime = addMinutes(start, duration ?? DEFAULT_DURATION_MINUTES);

    await this.appointmentChecker.assertNoConflictOrThrow({
      providerId,
      startTime: start,
      endTime,
    });

    return this.appointmentRepo.create({
      patientName,
      patientPhone,
      patientEmail,
      patientId,
      providerId,
      clinicId: actor.clinicId,
      treatmentId,
      startTime: start,
      endTime,
      notes,
    });
  }

  private async resolvePatient({
    patientId,
    dtoPatientName,
    dtoPatientPhone,
    dtoPatientEmail,
  }: ResolvePatientInput) {
    if (patientId) {
      const patient = await this.patientModuleApi.findPatientById(patientId);
      return {
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhone: patient.phone,
        patientEmail: patient.email ?? undefined,
      };
    }

    return {
      patientName: dtoPatientName!,
      patientPhone: dtoPatientPhone!,
      patientEmail: dtoPatientEmail,
    };
  }
}
