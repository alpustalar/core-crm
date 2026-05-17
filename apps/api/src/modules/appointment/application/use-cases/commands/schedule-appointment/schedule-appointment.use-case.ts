import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { PatientModuleApi } from '@modules/patient/patient.module.api';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ScheduleAppointmentDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { DateTimeManager } from '@common/utils';
import { POLICY_FACTORY_TOKEN } from '@modules/policy/domain/interfaces/policy-factory.interface';

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
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(dto: ScheduleAppointmentDto, context: IGetContext) {
    const { actor } = context;

    if (!actor.clinicId) {
      throw new BadRequestException('Actor için klinik tanımlanmamış.');
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(actor.clinicId),
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
    const endTime = DateTimeManager.addMinutes(
      start,
      duration ?? DEFAULT_DURATION_MINUTES
    );

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
      const { data: patient } = await this.patientModuleApi.findPatientById(
        patientId,
        ExecutionContextFactory.createInternal()
      );
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
