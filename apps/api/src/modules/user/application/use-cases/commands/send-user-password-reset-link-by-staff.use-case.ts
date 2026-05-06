import { FirebaseService } from '@modules/firebase/firebase.service';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { SendUserPasswordResetByActorDto } from '@shared';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { UserEventPublisher } from '@modules/user/infrastructure/events/publisher';
import { ISendUserPasswordResetLinkByActorEvent } from '@modules/user/domain/events/send-user-password-reset-link-by-actor.event';

@Injectable()
export class SendUserPasswordResetLinkByActorUseCase {
  constructor(
    private readonly firebaseService: FirebaseService,
    protected readonly policyFactory: PolicyFactory,
    private readonly userEventPublisher: UserEventPublisher,
    private readonly userRepo: UserRepository
  ) {}

  async execute(dto: SendUserPasswordResetByActorDto, actor: ActorContext) {
    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInMyClinicForManage({ clinicId: dto.clinicId }))
      .orThrow(() => {
        this.publisher({
          actor,
          details: `Başka klinik kullanıcısı için işlem yapılmaya çalışıldı: Hedef Kullanıcı: ${dto.userId}`,
        });
      });

    const user = await this.userRepo.findOneWithAnIdOrEmail(dto.userId);

    await this.firebaseService.generatePasswordResetLink(user.email);
  }

  publisher(event: ISendUserPasswordResetLinkByActorEvent) {
    this.userEventPublisher.sendUserPasswordResetLinkByActor(event);
  }
}
