import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteAppointmentsByOrganizationIdCommand } from './soft-delete-appointments-by-organization-id.command';
import { SoftDeleteAppointmentsByOrganizationIdCommandResponse } from './soft-delete-appointments-by-organization-id.response';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { Inject } from '@nestjs/common';
import { InternalOnly } from '@common/decorators';

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
  @InternalOnly()
  async execute(
    command: SoftDeleteAppointmentsByOrganizationIdCommand
  ): Promise<SoftDeleteAppointmentsByOrganizationIdCommandResponse> {
    const { organizationId } = command;

    await this.appointmentRepo.softDeleteAllByOrganizationId(organizationId);
  }
}
