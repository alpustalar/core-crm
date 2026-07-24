import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkNoShowCommand } from './mark-no-show.command';
import { MarkNoShowCommandResponse } from './mark-no-show.response';
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

@CommandHandler(MarkNoShowCommand)
export class MarkNoShowHandler
  implements ICommandHandler<MarkNoShowCommand, MarkNoShowCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: MarkNoShowCommand
  ): Promise<MarkNoShowCommandResponse> {
    const { appointmentId, ctx } = command;
    const { actor, source } = ctx;

    const appointment =
      await this.appointmentCommandRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(actor, source)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.NO_SHOW);

    const validateOptions = this.policyFactory
      .entity(actor, source)
      .policy.getValidateOptions();

    appointment.rules(validateOptions).markAsNoShow.orThrow();

    appointment.markAsNoShow();

    await this.appointmentCommandRepo.save(appointment);
  }
}
