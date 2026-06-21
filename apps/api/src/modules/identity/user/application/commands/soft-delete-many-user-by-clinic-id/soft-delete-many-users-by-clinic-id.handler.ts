import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  IUserQueryRepository,
  USER_COMMAND_REPOSITORY,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { SoftDeleteManyUsersByClinicIdCommand } from '@modules/identity/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.command';
import { SoftDeleteManyUserByClinicIdResponse } from '@modules/identity/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-user-by-clinic-id.response';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(SoftDeleteManyUsersByClinicIdCommand)
export class SoftDeleteManyUsersByClinicIdHandler
  implements
    ICommandHandler<
      SoftDeleteManyUsersByClinicIdCommand,
      SoftDeleteManyUserByClinicIdResponse
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
  async execute(command: SoftDeleteManyUsersByClinicIdCommand): Promise<void> {
    const users = await this.userQueryRepo.findAllActiveByClinicId(
      command.clinicId
    );

    const toDelete = users.filter((u) => u.canSoftDelete());

    if (toDelete.length === 0) return;

    toDelete.forEach((u) => u.softDelete());

    await this.txManager.run(async () => {
      await this.userCommandRepo.saveMany(toDelete);
    });

    await this.redis.deleteManyActorContexts(toDelete.map((u) => u.id));
  }
}
