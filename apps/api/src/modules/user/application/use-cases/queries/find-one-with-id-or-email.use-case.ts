import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { ActorContext } from '@common/interfaces';
import {
  UserResponseGroups,
  UserResponseGroupsType,
} from '../../../domain/constants';
import { Injectable } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';

@Injectable()
export class FindOneWithUserIdOrEmailUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    protected readonly policyFactory: PolicyFactory
  ) {}

  async execute(userIdOrEmail: string, actor: ActorContext) {
    const user = await this.userRepo.findOneWithAnIdOrEmail(userIdOrEmail);

    const { policy } = this.policyFactory.user(actor);
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
