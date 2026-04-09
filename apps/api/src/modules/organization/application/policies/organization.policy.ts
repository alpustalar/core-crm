import { ClinicPolicy } from '@modules/clinic/application/policies';

export class OrganizationPolicy extends ClinicPolicy {
  isOwnOrganization(organizationId?: string): boolean {
    if (this.isSystemAdmin()) return true;
    if (!organizationId) return false;

    return (
      this.actor.ownedOrganizations?.some((org) => org.id === organizationId) ??
      false
    );
  }

  getOrganizationFilter(organizationId?: string) {
    if (!organizationId) return undefined;
    if (this.isSystemAdmin()) return { id: organizationId };

    return {
      id: organizationId,
      organizationOwners: { some: { id: this.actor.userId } },
    };
  }
}
