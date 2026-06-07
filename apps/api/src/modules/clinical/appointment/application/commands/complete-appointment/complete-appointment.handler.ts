import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteAppointmentCommand } from './complete-appointment.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentCommandRepository,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(CompleteAppointmentCommand)
export class CompleteAppointmentHandler
  implements ICommandHandler<CompleteAppointmentCommand, void>
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentQueryRepo: IAppointmentQueryRepository,
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
        await this.appointmentQueryRepo.findById(appointmentId);

      if (!appointment) {
        throw new NotFoundException('Randevu bulunamadı.');
      }

      this.policyFactory
        .appointment(actor)
        .evaluator.check(
          (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
          'Bu randevuya erişim yetkiniz yok.'
        )
        .orThrow();

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
