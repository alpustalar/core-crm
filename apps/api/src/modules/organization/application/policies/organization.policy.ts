import { BasePolicy } from '@modules/policy/application/base.policy';
import { isEmpty } from '@common/utils/is-empty';

export class OrganizationPolicy extends BasePolicy {
  isOwnOrganization(targetOrganizationId?: string): boolean {
    if (!targetOrganizationId || isEmpty(this.actor.ownedOrganizations))
      return false;

    return this.actor.ownedOrganizations?.some(
      (org) => org.id === targetOrganizationId
    );
  }
}
