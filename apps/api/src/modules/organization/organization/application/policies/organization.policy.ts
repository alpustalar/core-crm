import { BasePolicy } from '@modules/platform/policy/staff/application/base.policy';
import { isEmpty } from '@common/utils/is-empty';

export class OrganizationPolicy extends BasePolicy {
  actorCanManageTargetOrganization(targetOrganizationId?: string): boolean {
    if (!targetOrganizationId || isEmpty(this.actor.ownedOrganizations))
      return false;

    return this.actor.ownedOrganizations?.some(
      (org) => org.id === targetOrganizationId
    );
  }

  actorCanAccessTargetOrganization(targetOrganizationId: string): boolean {
    const isSameOrganization =
      targetOrganizationId === this.actor.organizationId;
    const isOwenOrganization =
      this.actorCanManageTargetOrganization(targetOrganizationId);

    return isSameOrganization || isOwenOrganization;
  }

  getSerializationOptions() {
    return {
      groups: [],
      isGroupActive: true,
    };
  }
}
