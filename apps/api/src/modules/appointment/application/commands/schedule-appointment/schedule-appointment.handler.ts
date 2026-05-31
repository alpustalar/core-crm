import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleAppointmentCommand } from './schedule-appointment.command';
import { ScheduleAppointmentCommandResponse } from './schedule-appointment.response';
import { BadRequestException, Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentChecker } from '@modules/appointment/domain/services/appointment-checker.service';
import { POLICY_FACTORY } from '@modules/policy/domain/interfaces/policy-factory.interface';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { FindPatientByIdQuery } from '@modules/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { DateTimeManager } from '@common/utils';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

const DEFAULT_DURATION_MINUTES = 30;

interface ResolvePatientProps {
  patientId?: string;
  dtoPatientName?: string;
  dtoPatientPhone?: string;
  dtoPatientEmail?: string;
}

@CommandHandler(ScheduleAppointmentCommand)
export class ScheduleAppointmentHandler
  implements
    ICommandHandler<
      ScheduleAppointmentCommand,
      ScheduleAppointmentCommandResponse
    >
{
  private readonly internalCtx = ExecutionContextFactory.createInternal();

  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    private readonly appointmentChecker: AppointmentChecker,
    private readonly queryBus: TSQueryBus,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(
    command: ScheduleAppointmentCommand
  ): Promise<ScheduleAppointmentCommandResponse> {
    const { ctx, dto } = command;

    const { actor } = ctx;

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

    await this.appointmentChecker.noConflictOrThrow({
      providerId,
      startTime: start,
      endTime,
    });

    const appointmentEntity = await this.appointmentRepo.create({
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

    return appointmentEntity.id;
  }

  private async resolvePatient({
    patientId,
    dtoPatientName,
    dtoPatientPhone,
    dtoPatientEmail,
  }: ResolvePatientProps) {
    if (patientId) {
      const { data: patient } = await this.queryBus.execute(
        new FindPatientByIdQuery(patientId, this.internalCtx)
      );

      if (patient) {
        return {
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientPhone: patient.phone,
          patientEmail: patient.email ?? undefined,
        };
      }
    }

    return {
      patientName: dtoPatientName!,
      patientPhone: dtoPatientPhone!,
      patientEmail: dtoPatientEmail,
    };
  }
}
