import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelAppointmentCommand } from './cancel-appointment.command';
import { CancelAppointmentCommandResponse } from './cancel-appointment.response';
import { Inject } from '@nestjs/common';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

@CommandHandler(CancelAppointmentCommand)
export class CancelAppointmentHandler implements ICommandHandler<
  CancelAppointmentCommand,
  CancelAppointmentCommandResponse
> {
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: CancelAppointmentCommand
  ): Promise<CancelAppointmentCommandResponse> {
    const { appointmentId, cancelReason } = command.data;
    const { actor, source } = command.ctx;

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(actor, source)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CANCELLED);

    const validateOptions = this.policyFactory
      .entity(actor, source)
      .policy.getValidateOptions();

    appointment.rules(validateOptions).canBeScheduled.orThrow();

    appointment.cancelSchedule({
      canceledBy: actor.userId,
      reason: cancelReason,
    });

    // sağlık turizmi iadesi gibi kritik yan etkileri tetikleyebildiği için
    // eventler outbox
    await this.txManager.outboxRun(async () => {
      await this.appointmentRepo.update(appointment);
    });
  }
}
