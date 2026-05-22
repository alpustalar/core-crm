// update-user-by-self.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserBySelfCommand } from './update-user-by-self.command';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { UpdateUserBySelfResponse } from '@modules/user/application/commands/update-user-by-self/update-user-by-self.response';

@CommandHandler(UpdateUserBySelfCommand)
export class UpdateUserBySelfHandler
  implements ICommandHandler<UpdateUserBySelfCommand, UpdateUserBySelfResponse>
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(
    command: UpdateUserBySelfCommand
  ): Promise<UpdateUserBySelfResponse> {
    const { dto, actor } = command;

    await this.userRepo.update(actor.userId, dto);
  }
}
