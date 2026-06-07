import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkNoShowCommand } from './mark-no-show.command';
import { MarkNoShowCommandResponse } from './mark-no-show.response';
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

@CommandHandler(MarkNoShowCommand)
export class MarkNoShowHandler
  implements ICommandHandler<MarkNoShowCommand, MarkNoShowCommandResponse>
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
    command: MarkNoShowCommand
  ): Promise<MarkNoShowCommandResponse> {
    const { appointmentId, ctx } = command;
    const { actor } = ctx;

    const appointment = await this.appointmentQueryRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    appointment.markAsNoShow();

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow();

    await this.appointmentCommandRepo.save(appointment);
  }
}
