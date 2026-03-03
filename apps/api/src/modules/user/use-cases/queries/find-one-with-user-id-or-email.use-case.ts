import { UserRepository } from '../../repositories/user.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActorContext } from '@common/interfaces';
import { UserResponseGroups, UserResponseGroupsType } from '../../constants';
import { Injectable } from '@nestjs/common';
import { PolicyFactory } from '@common/policy/factory.policy';

@Injectable()
export class FindOneWithUserIdOrEmailUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma: PrismaService,
    protected readonly policyFactory: PolicyFactory,
  ) {}

  async execute(
    userIdOrEmail: string,
    actor: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    const user = await this.userRepo.findOneWithAnIdOrEmail(
      userIdOrEmail,
      client,
    );

    const policy = this.policyFactory.user(actor);
    const groups: UserResponseGroupsType[] = [];

    const isSameClinic = policy.isTargetInMyClinicForRead(user);
    const isDataOwner = policy.isSelf(user.id);

    const isGroupActive = isSameClinic || isDataOwner;

    if (isDataOwner) {
      groups.push(UserResponseGroups.DATA_OWNER);
    }

    return { user, isGroupActive, groups };
  }
}
