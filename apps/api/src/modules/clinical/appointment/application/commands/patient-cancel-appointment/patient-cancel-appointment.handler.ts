import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatientCancelAppointmentCommand } from './patient-cancel-appointment.command';
import { PatientCancelAppointmentResponse } from './patient-cancel-appointment.response';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentCommandRepository,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';

@CommandHandler(PatientCancelAppointmentCommand)
export class PatientCancelAppointmentHandler
  implements
    ICommandHandler<
      PatientCancelAppointmentCommand,
      PatientCancelAppointmentResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentQueryRepo: IAppointmentQueryRepository,
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository
  ) {}

  async execute(
    command: PatientCancelAppointmentCommand
  ): Promise<PatientCancelAppointmentResponse> {
    const { dto, ctx } = command;
    const { appointmentId, cancelReason } = dto;
    const { actor } = ctx;

    const appointment = await this.appointmentQueryRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    if (appointment.patientId !== actor.patientId) {
      throw new ForbiddenException('Bu randevuyu iptal etme yetkiniz yok.');
    }

    appointment.cancel(actor.patientId, cancelReason);

    await this.appointmentCommandRepo.save(appointment);
  }
}
