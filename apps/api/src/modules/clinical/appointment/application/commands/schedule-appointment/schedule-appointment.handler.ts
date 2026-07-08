import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleAppointmentCommand } from './schedule-appointment.command';
import { ScheduleAppointmentCommandResponse } from './schedule-appointment.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { POLICY_FACTORY } from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { PolicyFactory } from '@modules/platform/policy/staff/application/policy-factory';
import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';
import { TimeZoneSchema } from '@shared';

const DEFAULT_DURATION_MINUTES = 30;

interface ResolvePatientProps {
  patientId?: string | null;
  dtoPatientName?: string | null;
  dtoPatientPhone: string;
  dtoPatientEmail?: string | null;
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
    private readonly queryBus: TSQueryBus,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: PolicyFactory,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: ScheduleAppointmentCommand
  ): Promise<ScheduleAppointmentCommandResponse> {
    const { ctx, dto } = command;
    const { actor } = ctx;

    if (!actor.clinicId) throw new ClinicNotAssignedException();

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(actor.clinicId),
        'Sadece kendi kliniğinizde randevu oluşturabilirsiniz.'
      )
      .orThrow(APPOINTMENT_EVENTS.SCHEDULE);

    const {
      patientId,
      patientName: dtoPatientName,
      patientPhone: dtoPatientPhone,
      patientEmail: dtoPatientEmail,
      providerId,
      treatmentId,
      startTime,
      endTime: dtoEndTime,
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

    if (!patientPhone) {
      throw new Error('Patient phone is required');
    }

    const appointment = Appointment.schedule({
      patientName,
      patientPhone,
      patientEmail: patientEmail ?? null,
      patientId,
      providerId,
      clinicId: actor.clinicId,
      treatmentId,
      startTime,
      endTime: dtoEndTime,
      duration: duration ?? DEFAULT_DURATION_MINUTES,
      notes,
      timezone: TimeZoneSchema.enum.Europe_Istanbul,
      isConsultation: dto.isConsultation,
    });

    return this.transactionManager.run(async () => {
      const saved = await this.appointmentRepo.create(appointment);
      return saved.id.value;
    });
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
      patientPhone: dtoPatientPhone,
      patientEmail: dtoPatientEmail,
    };
  }
}
