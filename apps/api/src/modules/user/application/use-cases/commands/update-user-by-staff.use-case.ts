import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { ActorContext } from '@common/interfaces';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { UpdateUserByActorDto } from '@shared';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogAction } from '@common/constants/log-action.constant';
import { UserPrismaMapper } from '@modules/user/infrastructure/persistence/prisma/mappers/user-prisma.mapper';

export type UpdateUserByActorInput = {
  targetUpdateUserId: string;
  dto: UpdateUserByActorDto;
  actor: ActorContext;
};

@Injectable()
export class UpdateUserByActorUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    protected readonly policyFactory: PolicyFactory,
    private readonly auditLog: AuditLogService
  ) {}

  async execute({ targetUpdateUserId, dto, actor }: UpdateUserByActorInput) {
    this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isSelf(targetUpdateUserId),
        'Kendi yetkilerinizi buradan değiştiremezsiniz.'
      )
      .orThrow();

    const targetUser =
      await this.userRepo.findOneWithAnIdOrEmail(targetUpdateUserId);

    await this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isPrivilegedUser(),
        'Bu işlem için yetkili kullanıcı olmalısınız'
      )
      .check(
        (p) => p.hasHigherPriorityThan(targetUser),
        'Hedef kullanıcıdan daha yüksek bir yetkiye sahip olmalısınız'
      )
      .check(
        (p) => p.isTargetInMyClinicForManage(targetUser),
        'Hedef kullanıcı ile aynı klinikte (yönetici olarak) olmalısınız'
      )
      .orAsyncThrow(
        async (msg) =>
          await this.auditLog.log({
            action: LogAction.USER_UPDATE,
            userId: actor.userId,
            details: msg,
            source: actor.source,
          })
      );

    const { clinicId, providerProfile } = dto;

    if (providerProfile && !clinicId) {
      throw new BadRequestException(
        "'Provider profil oluşturmak için Klinik ID zorunludur.'"
      );
    }
    const data = UserPrismaMapper.toUpdateUserWithAnIdInput(dto);
    return this.userRepo.updateUserWithAnId(targetUpdateUserId, data);
  }
}
