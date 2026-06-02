import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLastLoginCommand } from './update-last-login.command';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { UpdateLastLoginResponse } from '@modules/user/application/commands/update-last-login/update-last-login.response';

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
