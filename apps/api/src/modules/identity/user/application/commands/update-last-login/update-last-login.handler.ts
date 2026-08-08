import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLastLoginCommand } from './update-last-login.command';
import { Inject } from '@nestjs/common';
import { UpdateLastLoginResponse } from '@modules/identity/user/application/commands/update-last-login/update-last-login.response';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.command.repository';

@CommandHandler(UpdateLastLoginCommand)
export class UpdateLastLoginHandler
  implements ICommandHandler<UpdateLastLoginCommand, UpdateLastLoginResponse>
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository
  ) {}

  async execute(
    command: UpdateLastLoginCommand
  ): Promise<UpdateLastLoginResponse> {
    const { userId } = command;
    await this.userRepo.updateLastLogin(userId);
  }
}
