import { FirebaseService } from '../../../firebase/firebase.service';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';
import { PolicyFactory } from '@common/policy/factory.policy';
import { SendUserPasswordResetByActorDto } from '@shared/modules';

@Injectable()
export class SendUserPasswordResetLinkByActorUseCase {
  constructor(
    private readonly firebaseService: FirebaseService,
    protected readonly policyFactory: PolicyFactory,
  ) {}

  async execute(
    dto: SendUserPasswordResetByActorDto,
    actor: ActorContext,
    email: string,
  ) {
    const policy = this.policyFactory.user(actor);
    policy.isTargetInMyClinicForManageOrThrow({ clinicId: dto.clinicId });
    await this.firebaseService.generatePasswordResetLink(email);
  }
}
