import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelAppointmentCommand } from './cancel-appointment.command';
import { CancelAppointmentCommandResponse } from './cancel-appointment.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(CancelAppointmentCommand)
export class CancelAppointmentHandler
  implements
    ICommandHandler<CancelAppointmentCommand, CancelAppointmentCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: CancelAppointmentCommand
  ): Promise<CancelAppointmentCommandResponse> {
    const { ctx, dto } = command;
    const { appointmentId, cancelReason } = dto;
    const { actor, source } = ctx;

    const appointment =
      await this.appointmentCommandRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    const { evaluator } = this.policyFactory.appointment(actor);
    evaluator
      .systemBypass(source)
      .check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CANCELLED);

    appointment.cancelSchedule(actor.userId, cancelReason);

    // İptal, sağlık turizmi iadesi gibi kritik yan etkileri tetikleyebildiği için
    // event'ler outbox ile atomik mühürlenir (AppointmentCancelledEvent).
    await this.txManager.outboxRun(async () => {
      await this.appointmentCommandRepo.save(appointment);
    });
  }
}
