import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { UpdateUserByStaffResponse } from '@modules/identity/user/application/commands/update-user-by-staff/update-user-by-staff.response';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
import {
  IUserCommandRepository,
  IUserQueryRepository,
  USER_COMMAND_REPOSITORY,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { USER_EVENTS } from '@src/domain/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { UpdateUserByStaffCommand } from './update-user-by-staff.command';

@CommandHandler(UpdateUserByStaffCommand)
export class UpdateUserByStaffHandler
  implements
    ICommandHandler<UpdateUserByStaffCommand, UpdateUserByStaffResponse>
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepo: IUserCommandRepository,
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userQueryRepo: IUserQueryRepository,
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher,
    private readonly redis: RedisService,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: UpdateUserByStaffCommand
  ): Promise<UpdateUserByStaffResponse> {
    const { targetUserId, dto, ctx } = command;
    const { actor } = ctx;

    this.policyFactory
      .user(actor)
      .evaluator.bypassIf(
        !dto.roleId &&
          !dto.ownedOrganizationIds &&
          !dto.organizationId &&
          !dto.managedClinicIds
      )
      .check(
        (p) => p.isSelf(targetUserId),
        'Kendi yetkilerinizi değiştiremezsiniz.'
      );

    const targetUser = await this.userQueryRepo.findByIdOrEmail(targetUserId);
    if (!targetUser) throw new NotFoundException('Kullanıcı bulunamadı');

    this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isPrivilegedUser(),
        'Bu işlem için yetkili kullanıcı olmalısınız'
      )
      .check(
        (p) => p.actorHasHigherPriorityThanTarget(targetUser.role),
        'Hedef kullanıcıdan daha yüksek bir yetkiye sahip olmalısınız'
      )
      .check(
        (p) => p.isTargetInActorsManagedClinic(targetUser.clinicId),
        'Hedef kullanıcı ile aynı klinikte (yönetici olarak) olmalısınız'
      )
      .orThrow(USER_EVENTS.UPDATE_BY_STAFF);

    targetUser.updateDetails(dto, actor.userId);

    await this.txManager.run(async () => {
      await this.userCommandRepo.save(targetUser);
      await this.redis.deleteActorContext(targetUserId);
    });
  }
}
