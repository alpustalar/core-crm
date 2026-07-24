import {
  ProviderResponseGroup,
  ProviderResponseGroups,
} from '@modules/clinical/provider/domain/contracts/provider.contracts';
import { UserPolicy } from '@modules/identity/user/application/policies/user.policy';

const { ADMIN, INTERNAL, FINANCIAL, DATA_OWNER, MANAGEMENT } =
  ProviderResponseGroups;

export class ProviderPolicy extends UserPolicy {
  getSerializationOptions(
    targetClinicId: string,
    providerId: string
  ): {
    isGroupActive: boolean;
    groups: ProviderResponseGroup[];
  } {
    const isSelf = this.actor.userId === providerId;
    const isAdmin = this.isSystem();
    const isSameClinic = this.isTargetInActorsSameClinic(targetClinicId);
    const isManager = this.isTargetInActorsManagedClinic(targetClinicId);

    const groups: ProviderResponseGroup[] = [];

    if (isSelf) groups.push(DATA_OWNER);
    if (isManager) groups.push(MANAGEMENT, FINANCIAL);
    if (isAdmin) groups.push(ADMIN);
    if (isSameClinic) groups.push(INTERNAL);

    return {
      isGroupActive: isManager || isSameClinic || isSelf || isAdmin,
      groups,
    };
  }
}
