import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';
import { UserUpdateBySelfDto } from '@shared';

@Injectable()
export class UpdateUserBySelfUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(data: UserUpdateBySelfDto, actor: ActorContext) {
    return this.userRepo.updateUserWithAnId(actor.userId, data);
  }
}
