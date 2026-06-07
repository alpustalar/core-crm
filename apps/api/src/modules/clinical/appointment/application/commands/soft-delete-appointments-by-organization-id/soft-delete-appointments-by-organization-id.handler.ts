import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteAppointmentsByOrganizationIdCommand } from './soft-delete-appointments-by-organization-id.command';
import { SoftDeleteAppointmentsByOrganizationIdCommandResponse } from './soft-delete-appointments-by-organization-id.response';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(SoftDeleteAppointmentsByOrganizationIdCommand)
export class SoftDeleteAppointmentsByOrganizationIdHandler
  implements
    ICommandHandler<
      SoftDeleteAppointmentsByOrganizationIdCommand,
      SoftDeleteAppointmentsByOrganizationIdCommandResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository
  ) {}
  async execute(
    command: SoftDeleteAppointmentsByOrganizationIdCommand
  ): Promise<SoftDeleteAppointmentsByOrganizationIdCommandResponse> {
    const { organizationId, ctx } = command;
    const { source } = ctx;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      await this.appointmentRepo.softDeleteAllByOrganizationId(organizationId);
    }
  }
}
