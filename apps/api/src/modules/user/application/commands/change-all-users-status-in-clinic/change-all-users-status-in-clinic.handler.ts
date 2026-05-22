import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import { ChangeAllUsersStatusInClinicCommand } from '@modules/user/application/commands/change-all-users-status-in-clinic/change-all-users-status-in-clinic.command';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeAllUsersStatusInClinicResponse } from '@modules/user/application/commands/change-all-users-status-in-clinic/change-all-users-status-in-clinic.response';

@CommandHandler(ChangeAllUsersStatusInClinicCommand)
export class ChangeAllUsersStatusInClinicHandler
  implements
    ICommandHandler<
      ChangeAllUsersStatusInClinicCommand,
      ChangeAllUsersStatusInClinicResponse
    >
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository
  ) {}

  @InternalOnly()
  async execute(
    command: ChangeAllUsersStatusInClinicCommand
  ): Promise<ChangeAllUsersStatusInClinicResponse> {
    const { status, clinicId } = command;
    await this.userRepo.changeAllStatusByClinicId(clinicId, status);
  }
}
