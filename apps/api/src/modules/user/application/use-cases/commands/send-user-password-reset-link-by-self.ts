import { Injectable } from '@nestjs/common';
import { FirebaseService } from '@modules/firebase/firebase.service';
import { ActorContext } from '@common/interfaces';

@Injectable()
export class SendUserPasswordResetLinkBySelfUseCase {
  constructor(private readonly firebase: FirebaseService) {}

  async execute(actor: ActorContext) {
    return await this.firebase.generatePasswordResetLink(actor.email);
  }
}
