// update-user-by-self.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserBySelfCommand } from './update-user-by-self.command';
import { Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER_TOKEN,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';

@CommandHandler(UpdateUserBySelfCommand)
export class UpdateUserBySelfHandler
  implements ICommandHandler<UpdateUserBySelfCommand>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(USER_EVENT_PUBLISHER_TOKEN)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(command: UpdateUserBySelfCommand) {
    const { dto, actor } = command;

    const updatedUser = await this.userRepo.updateUserWithAnId(
      actor.userId,
      dto
    );

    return updatedUser.id;
  }
}
