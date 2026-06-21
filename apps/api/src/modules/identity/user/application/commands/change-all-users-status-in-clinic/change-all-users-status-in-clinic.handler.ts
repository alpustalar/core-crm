import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  IUserQueryRepository,
  USER_COMMAND_REPOSITORY,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { ChangeAllUsersStatusInClinicCommand } from '@modules/identity/user/application/commands/change-all-users-status-in-clinic/change-all-users-status-in-clinic.command';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeAllUsersStatusInClinicResponse } from '@modules/identity/user/application/commands/change-all-users-status-in-clinic/change-all-users-status-in-clinic.response';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

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
    private readonly userCommandRepo: IUserCommandRepository,
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userQueryRepo: IUserQueryRepository,
    private readonly redis: RedisService,
    private readonly txManager: TransactionManager
  ) {}

  @InternalOnly()
  async execute(
    command: ChangeAllUsersStatusInClinicCommand
  ): Promise<ChangeAllUsersStatusInClinicResponse> {
    const { status, clinicId } = command;

    const users = await this.userQueryRepo.findAllByClinicId(clinicId);

    if (users.length === 0) return;

    users.forEach((u) => u.changeStatus(status));

    await this.txManager.run(async () => {
      await this.userCommandRepo.saveMany(users);
    });

    await this.redis.deleteManyActorContexts(users.map((u) => u.id));
  }
}
