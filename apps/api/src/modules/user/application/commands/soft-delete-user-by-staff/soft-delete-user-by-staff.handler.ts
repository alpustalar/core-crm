import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteUserByStaffCommand } from '@modules/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUserCommandRepository,
  IUserQueryRepository,
  USER_COMMAND_REPOSITORY,
  USER_QUERY_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { SoftDeleteUserByStaffResponse } from '@modules/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.response';
import { RedisService } from '@common/redis/redis.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

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
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher,
    private readonly txManager: TransactionManager,
    private readonly redis: RedisService
  ) {}

  async execute(
    command: SoftDeleteUserByStaffCommand
  ): Promise<SoftDeleteUserByStaffResponse> {
    const { dto, ctx } = command;
    const { actor, source } = ctx;

    if (ExecutionPolicy.isUserInitiated(source)) {
      this.policyFactory
        .user(actor)
        .evaluator.check(
          (p) => p.isTargetInActorsManagedClinic(dto.clinicId),
          'Bu yetkiye sahip değilsiniz'
        )
        .orThrow((msg) => {
          // TODO: LOG FIRLAT
        });
    }

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
