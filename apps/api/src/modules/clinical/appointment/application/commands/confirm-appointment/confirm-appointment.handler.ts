import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmAppointmentCommand } from './confirm-appointment.command';
import { ConfirmAppointmentCommandResponse } from './confirm-appointment.response';
import { Inject } from '@nestjs/common';

import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

@CommandHandler(ConfirmAppointmentCommand)
export class ConfirmAppointmentHandler implements ICommandHandler<
  ConfirmAppointmentCommand,
  ConfirmAppointmentCommandResponse
> {
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: ConfirmAppointmentCommand
  ): Promise<ConfirmAppointmentCommandResponse> {
    const { appointmentId, ctx } = command;

    const appointment = await this.appointmentRepo.findById(appointmentId);

    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CONFIRMED);

    const validateOptions = this.policyFactory
      .entity(ctx.actor, ctx.source)
      .policy.getValidateOptions();

    appointment.rules(validateOptions).confirm.orThrow();

    appointment.confirm();

    await this.txManager.run(async () => {
      await this.appointmentRepo.update(appointment);
    });
  }
}
