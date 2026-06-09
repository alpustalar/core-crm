import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelAppointmentCommand } from './cancel-appointment.command';
import { CancelAppointmentCommandResponse } from './cancel-appointment.response';
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
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';

@CommandHandler(CancelAppointmentCommand)
export class CancelAppointmentHandler
  implements
    ICommandHandler<CancelAppointmentCommand, CancelAppointmentCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentQueryRepo: IAppointmentQueryRepository,
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: CancelAppointmentCommand
  ): Promise<CancelAppointmentCommandResponse> {
    const { ctx, dto } = command;
    const { appointmentId, cancelReason } = dto;
    const { actor, source } = ctx;

    const appointment = await this.appointmentQueryRepo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Randevu bulunamadı.');

    const { evaluator } = this.policyFactory.appointment(actor);
    evaluator
      .bypassIf(ExecutionPolicy.isSystemInitiated(source))
      .check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CANCELLED);

    appointment.cancelSchedule(actor.userId, cancelReason);
    await this.appointmentCommandRepo.save(appointment);
  }
}
