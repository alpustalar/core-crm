import { UserPolicy } from '@modules/user/application/policies/user.policy';
import { ActorContext, IResponsePolicy } from '@common/interfaces';
import { User } from '@prisma/client';
import {
  UserResponseGroups,
  UserResponseGroupsType,
} from '@modules/user/constants';

const {
  DATA_OWNER,
  AUDIT,
  INTERNAL,
  MANAGEMENT_BASIC,
  MANAGEMENT_FULL,
  FINANCIAL,
  MEDICAL,
} = UserResponseGroups;

const ALL_GROUPS: UserResponseGroupsType[] = Object.values(UserResponseGroups);

export class UserResponsePolicy extends UserPolicy implements IResponsePolicy {
  constructor(protected actor: ActorContext) {
    super(actor);
  }

  groups(targetUser: User): UserResponseGroupsType[] | undefined {
    if (this.isSystemAdmin()) {
      return ALL_GROUPS;
    }
    if (!this.isTargetInMyClinicForRead(targetUser)) {
      return undefined;
    }

    const groupsSet = new Set<UserResponseGroupsType>();
    groupsSet.add(INTERNAL);

    if (this.isSelf(targetUser.id)) {
      groupsSet.add(DATA_OWNER);
    }

    if (this.isTargetInMyClinicForManage(targetUser)) {
      groupsSet.add(MANAGEMENT_BASIC);
      groupsSet.add(AUDIT);
      groupsSet.add(MANAGEMENT_FULL);
      groupsSet.add(FINANCIAL);
      groupsSet.add(MEDICAL);
    }

    return Array.from(groupsSet);
  }
}
