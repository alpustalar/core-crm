import { ActorContext } from '@common/interfaces';
import { FirebaseService } from '@modules/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { ChangeUserPasswordDto } from '@shared';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly firebaseService: FirebaseService) {}

  async execute(dto: ChangeUserPasswordDto, actor: ActorContext) {
    await this.firebaseService.changePassword({
      id: actor.userId,
      password: dto.password,
    });
  }
}
