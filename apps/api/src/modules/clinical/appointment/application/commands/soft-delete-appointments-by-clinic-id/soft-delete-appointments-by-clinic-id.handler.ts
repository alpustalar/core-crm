import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteAppointmentsByClinicIdCommand } from './soft-delete-appointments-by-clinic-id.command';
import { SoftDeleteAppointmentsByClinicIdCommandResponse } from './soft-delete-appointments-by-clinic-id.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';

@CommandHandler(SoftDeleteAppointmentsByClinicIdCommand)
export class SoftDeleteAppointmentsByClinicIdHandler
  implements
    ICommandHandler<
      SoftDeleteAppointmentsByClinicIdCommand,
      SoftDeleteAppointmentsByClinicIdCommandResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository
  ) {}

  async execute(
    command: SoftDeleteAppointmentsByClinicIdCommand
  ): Promise<SoftDeleteAppointmentsByClinicIdCommandResponse> {
    const { clinicId, ctx } = command;

    if (ExecutionPolicy.isSystemInitiated(ctx.source)) {
      await this.appointmentRepo.softDeleteAllAppointmentsByClinicId(clinicId);
    }
  }
}
