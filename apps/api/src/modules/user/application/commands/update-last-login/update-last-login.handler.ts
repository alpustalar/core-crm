import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLastLoginCommand } from './update-last-login.command';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';

@CommandHandler(UpdateLastLoginCommand)
export class UpdateLastLoginHandler
  implements ICommandHandler<UpdateLastLoginCommand, string | null>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository
  ) {}

  async execute(command: UpdateLastLoginCommand) {
    const { userId } = command;
    const user = await this.userRepo.update(userId, {
      lastLogin: new Date(),
    });
    return user?.id ?? null;
  }
}
