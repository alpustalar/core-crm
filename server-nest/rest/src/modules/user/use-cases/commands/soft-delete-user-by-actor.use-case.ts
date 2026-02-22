import { UserRepository } from '../../repositories/user.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ActorContext } from '@common/interfaces';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PolicyFactory } from '@common/policy/factory.policy';
import { UserSoftDeleteByActorDto } from '@shared/modules';

@Injectable()
export class SoftDeleteUserByActorUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma: PrismaService,
    protected readonly policyFactory: PolicyFactory,
  ) {}

  async execute(
    dto: UserSoftDeleteByActorDto,
    actor: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const policy = this.policyFactory.user(actor);

    if (!policy.canManagePartialUser(dto.clinicId)) {
      throw new ForbiddenException('Bu yetkiye sahip değilsiniz');
    }

    const client = tx ?? this.prisma;
    return this.userRepo.softDeleteUserWithAnId(actor.userId, client);
  }
}
