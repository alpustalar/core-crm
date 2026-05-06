import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { UserSoftDeleteByActorDto } from '@shared';

@Injectable()
export class SoftDeleteUserByActorUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    protected readonly policyFactory: PolicyFactory
  ) {}

  async execute(dto: UserSoftDeleteByActorDto, actor: ActorContext) {
    const { evaluator } = this.policyFactory.user(actor);
    evaluator
      .check(
        (p) => p.isTargetInMyClinicForManage(dto),
        'Bu yetkiye sahip değilsiniz'
      )
      .orThrow();
    return this.userRepo.softDeleteUserWithAnId(actor.userId);
  }
}
