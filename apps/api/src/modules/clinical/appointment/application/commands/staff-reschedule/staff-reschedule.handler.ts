import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { StaffRescheduleCommand } from './staff-reschedule.command';
import { StaffRescheduleCommandResponse } from './staff-reschedule.response';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';

@CommandHandler(StaffRescheduleCommand)
export class StaffRescheduleHandler
  implements
    ICommandHandler<StaffRescheduleCommand, StaffRescheduleCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: StaffRescheduleCommand
  ): Promise<StaffRescheduleCommandResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    const { appointmentId, startTime, duration, notes, treatmentId } = dto;

    const endTime = Appointment.calculateEndTime(
      startTime,
      dto.endTime,
      duration
    ).orThrow();

    const appointment =
      await this.appointmentCommandRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuyu yeniden zamanlamak için yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.RESCHEDULE);

    const effectiveProviderId = dto.providerId ?? appointment.providerId.value;

    appointment.reschedule(
      startTime,
      endTime,
      effectiveProviderId,
      notes,
      treatmentId
    );

    await this.appointmentCommandRepo.save(appointment);
  }
}
