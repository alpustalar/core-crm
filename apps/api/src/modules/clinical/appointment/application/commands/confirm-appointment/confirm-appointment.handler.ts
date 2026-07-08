import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmAppointmentCommand } from './confirm-appointment.command';
import { ConfirmAppointmentCommandResponse } from './confirm-appointment.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

@CommandHandler(ConfirmAppointmentCommand)
export class ConfirmAppointmentHandler
  implements
    ICommandHandler<
      ConfirmAppointmentCommand,
      ConfirmAppointmentCommandResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: ConfirmAppointmentCommand
  ): Promise<ConfirmAppointmentCommandResponse> {
    const { appointmentId, ctx } = command;

    const { actor } = ctx;
    const appointment =
      await this.appointmentCommandRepo.findById(appointmentId);

    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CONFIRMED);

    appointment.confirm();

    await this.appointmentCommandRepo.save(appointment);
  }
}
