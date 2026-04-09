import { FirebaseService } from '@modules/firebase/firebase.service';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { SendUserPasswordResetByActorDto } from '@shared';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { AuditAction } from '@modules/audit-log/enums/audit-action.enum';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';

@Injectable()
export class SendUserPasswordResetLinkByActorUseCase {
  constructor(
    private readonly firebaseService: FirebaseService,
    protected readonly policyFactory: PolicyFactory,
    private readonly auditLog: AuditLogService,
    private readonly userRepo: UserRepository
  ) {}

  async execute(dto: SendUserPasswordResetByActorDto, actor: ActorContext) {
    const { evaluator } = this.policyFactory.user(actor);
    const check = evaluator.check((p) =>
      p.isTargetInMyClinicForManage({ clinicId: dto.clinicId })
    );

    if (!check.allowed()) {
      await this.auditLog.log({
        action: AuditAction.USER_SEND_PASSWORD_RESET_LINK,
        source: actor.source,
        details: 'Başka klinik kullanıcısı için işlem yapılmaya çalışıldı.',
        userId: actor?.userId,
      });
      check.orThrow();
    }

    const user = await this.userRepo.findOneWithAnIdOrEmail(dto.userId);

    await this.firebaseService.generatePasswordResetLink(user.email);
  }
}
