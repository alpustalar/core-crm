import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserByStaffCommand } from './update-user-by-staff.command';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
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
import { UpdateUserByStaffResponse } from '@modules/user/application/commands/update-user-by-staff/update-user-by-staff.response';

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
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(
    command: UpdateUserByStaffCommand
  ): Promise<UpdateUserByStaffResponse> {
    const { targetUserId, dto, ctx } = command;
    const { actor } = ctx;

    this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isSelf(targetUserId),
        'Kendi yetkilerinizi buradan değiştiremezsiniz.'
      )
      .orThrow();

    const targetUser = await this.userQueryRepo.findByIdOrEmail(targetUserId);
    if (!targetUser) throw new NotFoundException('Kullanıcı bulunamadı');

    // Privilege Policy Checks & Security Event
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
      .orThrow((msg) => {
        // GÜVENLİK EVENT'İ: Burada event yapısını tetikliyoruz
        this.userEventPublisher.updateUserByStaff({
          userId: targetUserId,
          type: LogType.SECURITY,
          actorId: actor.userId,
          details: msg,
          source: actor.source,
          action: LogAction.USER_UPDATE,
        });
      });

    // Business Logic
    if (dto.providerProfile && !dto.clinicId) {
      throw new BadRequestException(
        'Provider profil oluşturmak için Klinik ID zorunludur.'
      );
    }

    // Persistence
    await this.userCommandRepo.update(targetUserId, dto);

    this.userEventPublisher.updateUserByStaff({
      userId: targetUserId,
      type: LogType.INFO,
      actorId: actor.userId,
      details: 'Kullanıcı bilgileri başarıyla güncellendi.',
      source: actor.source,
      action: LogAction.USER_UPDATE,
    });
  }
}
