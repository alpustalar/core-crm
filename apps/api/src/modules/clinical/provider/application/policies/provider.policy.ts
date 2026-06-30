import {
  ProviderResponseGroup,
  ProviderResponseGroups,
} from '@modules/clinical/provider/domain/contracts/provider.contracts';
import { UserPolicy } from '@modules/identity/user/application/policies/user.policy';

export class ProviderPolicy extends UserPolicy {
  getSerializeOptions(
    targetClinicId: string,
    providerId: string
  ): {
    isGroupActive: boolean;
    groups: ProviderResponseGroup[];
  } {
    const isSelf = this.actor.userId === providerId;
    const isAdmin = this.isSystemAdmin();
    const isSameClinic = this.isTargetInActorsSameClinic(targetClinicId);
    const isManager = this.isTargetInActorsManagedClinic(targetClinicId);

    const groups: ProviderResponseGroup[] = [];

    if (isSelf) groups.push(ProviderResponseGroups.DATA_OWNER);
    if (isManager) {
      groups.push(ProviderResponseGroups.MANAGEMENT);
      groups.push(ProviderResponseGroups.FINANCIAL);
    }
    if (isAdmin) groups.push(ProviderResponseGroups.ADMIN);

    return {
      isGroupActive: !!(isManager || isSameClinic || isSelf || isAdmin),
      groups,
    };
  }
}
