import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserByStaffCommand } from './update-user-by-staff.command';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER_TOKEN,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';

@CommandHandler(UpdateUserByStaffCommand)
export class UpdateUserByStaffHandler
  implements ICommandHandler<UpdateUserByStaffCommand, string>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER_TOKEN)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(command: UpdateUserByStaffCommand) {
    const { targetUserId, dto, context } = command;
    const { actor } = context;

    this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isSelf(targetUserId),
        'Kendi yetkilerinizi buradan değiştiremezsiniz.'
      )
      .orThrow();

    const targetUser = await this.userRepo.findByIdOrEmail(targetUserId);
    if (!targetUser) throw new NotFoundException('Kullanıcı bulunamadı');

    // 2. Privilege Policy Checks & Security Event
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

    // 3. Business Logic
    if (dto.providerProfile && !dto.clinicId) {
      throw new BadRequestException(
        'Provider profil oluşturmak için Klinik ID zorunludur.'
      );
    }

    // 4. Persistence
    const updatedUser = await this.userRepo.update(targetUserId, dto);

    this.userEventPublisher.updateUserByStaff({
      userId: targetUserId,
      type: LogType.INFO,
      actorId: actor.userId,
      details: 'Kullanıcı bilgileri başarıyla güncellendi.',
      source: actor.source,
      action: LogAction.USER_UPDATE,
    });

    return updatedUser.id;
  }
}
