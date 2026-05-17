import { Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import { ChangeAllUsersStatusInClinicCommand } from '@modules/user/application/commands/change-all-users-status-in-clinic/change-all-users-status-in-clinic.command';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(ChangeAllUsersStatusInClinicCommand)
export class ChangeAllUsersStatusInClinicHandler
  implements ICommandHandler<ChangeAllUsersStatusInClinicCommand, void>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository
  ) {}

  @InternalOnly()
  async execute(command: ChangeAllUsersStatusInClinicCommand) {
    const { status, clinicId } = command;
    await this.userRepo.changeAllStatusByClinicId(clinicId, status);
  }
}
