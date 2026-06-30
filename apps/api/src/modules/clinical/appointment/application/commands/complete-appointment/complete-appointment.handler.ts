import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteAppointmentCommand } from './complete-appointment.command';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

@CommandHandler(CompleteAppointmentCommand)
export class CompleteAppointmentHandler
  implements ICommandHandler<CompleteAppointmentCommand, void>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CompleteAppointmentCommand): Promise<void> {
    const { appointmentId, ctx } = command;
    const { actor } = ctx;

    await this.txManager.run(async () => {
      const appointment =
        await this.appointmentCommandRepo.findById(appointmentId);

      if (!appointment) throw new AppointmentNotFoundException();

      this.policyFactory
        .appointment(actor)
        .evaluator.check(
          (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
          'Bu randevuya erişim yetkiniz yok.'
        )
        .orThrow(APPOINTMENT_EVENTS.COMPLETED);

      appointment.complete({
        action: LogAction.APPOINTMENT_COMPLETE,
        type: LogType.INFO,
        actorId: actor.userId,
        source: actor.source,
      });

      await this.appointmentCommandRepo.save(appointment);
    });
  }
}
