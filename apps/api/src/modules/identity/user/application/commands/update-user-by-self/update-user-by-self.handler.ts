import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { UpdateUserBySelfCommand } from './update-user-by-self.command';
import { UpdateUserBySelfResponse } from './update-user-by-self.response';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';

@CommandHandler(UpdateUserBySelfCommand)
export class UpdateUserBySelfHandler implements ICommandHandler<
  UpdateUserBySelfCommand,
  UpdateUserBySelfResponse
> {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepo: IUserCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateUserBySelfCommand): Promise<void> {
    const { data, actor } = command;

    const user = await this.userCommandRepo.findById(actor.userId);

    if (!user) throw new UserNotFoundException();

    user.updateDetails(
      {
        displayName: data.displayName,
        picture: data.picture,
        phoneNumber: data.phoneNumber,
      },
      actor.userId
    );

    await this.txManager.run(async () => {
      await this.userCommandRepo.update(user);
    });
  }
}
