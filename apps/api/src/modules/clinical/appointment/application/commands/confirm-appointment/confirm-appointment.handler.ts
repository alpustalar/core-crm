import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmAppointmentCommand } from './confirm-appointment.command';
import { ConfirmAppointmentCommandResponse } from './confirm-appointment.response';
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

@CommandHandler(ConfirmAppointmentCommand)
export class ConfirmAppointmentHandler
  implements
    ICommandHandler<
      ConfirmAppointmentCommand,
      ConfirmAppointmentCommandResponse
    >
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
    command: ConfirmAppointmentCommand
  ): Promise<ConfirmAppointmentCommandResponse> {
    const { appointmentId, ctx } = command;

    const { actor } = ctx;
    const appointment = await this.appointmentQueryRepo.findById(appointmentId);
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

    appointment.confirm();

    await this.appointmentCommandRepo.save(appointment);
  }
}
