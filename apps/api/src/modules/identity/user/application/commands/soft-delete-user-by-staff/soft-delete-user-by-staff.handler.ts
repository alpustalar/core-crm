import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteUserByStaffCommand } from '@modules/identity/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUserCommandRepository,
  IUserQueryRepository,
  USER_COMMAND_REPOSITORY,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { SoftDeleteUserByStaffResponse } from '@modules/identity/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.response';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { USER_EVENTS } from '@src/domain/constants/events';

@CommandHandler(SoftDeleteUserByStaffCommand)
export class SoftDeleteUserByStaffHandler
  implements
    ICommandHandler<
      SoftDeleteUserByStaffCommand,
      SoftDeleteUserByStaffResponse
    >
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepo: IUserCommandRepository,
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userQueryRepo: IUserQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager,
    private readonly redis: RedisService
  ) {}

  async execute(
    command: SoftDeleteUserByStaffCommand
  ): Promise<SoftDeleteUserByStaffResponse> {
    const { dto, ctx } = command;
    const { actor, source } = ctx;

    const { evaluator } = this.policyFactory.user(actor);
    evaluator
      .bypassIf(ExecutionPolicy.isSystemInitiated(source))
      .check(
        (p) => p.isTargetInActorsManagedClinic(dto.clinicId),
        'Bu yetkiye sahip değilsiniz'
      )
      .orThrow(USER_EVENTS.SOFT_DELETED);

    const user = await this.userQueryRepo.find(dto.userId);

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    user.softDelete();

    await this.txManager.run(async () => {
      await this.userCommandRepo.save(user);
    });
    await this.redis.deleteActorContext(dto.userId);
  }
}
