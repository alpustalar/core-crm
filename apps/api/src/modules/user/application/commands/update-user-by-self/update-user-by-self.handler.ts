import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUserCommandRepository,
  IUserQueryRepository,
  USER_COMMAND_REPOSITORY,
  USER_QUERY_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { UpdateUserBySelfCommand } from './update-user-by-self.command';
import { UpdateUserBySelfResponse } from './update-user-by-self.response';

@CommandHandler(UpdateUserBySelfCommand)
export class UpdateUserBySelfHandler
  implements ICommandHandler<UpdateUserBySelfCommand, UpdateUserBySelfResponse>
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepo: IUserCommandRepository,
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userQueryRepo: IUserQueryRepository,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: UpdateUserBySelfCommand): Promise<void> {
    const { dto, actor } = command;

    const user = await this.userQueryRepo.find(actor.userId);
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    user.updateDetails({
      displayName: dto.displayName,
      picture: dto.picture,
      phoneNumber: dto.phoneNumber,
    });

    await this.txManager.run(async () => {
      await this.userCommandRepo.save(user);
    });
  }
}
