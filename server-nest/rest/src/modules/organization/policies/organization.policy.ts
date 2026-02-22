import { ClinicPolicy } from '@modules/clinic/policies';
import { ForbiddenException } from '@nestjs/common';

export class OrganizationPolicy extends ClinicPolicy {
  isOwnOrganization(organizationId?: string): boolean {
    // 1. Admin ise sorgusuz sualsiz true
    if (this.isSystemAdmin()) return true;
    if (!organizationId) return false;

    // 2. Değilse actor içindeki listeye bak
    return (
      this.actor.ownedOrganizations?.some((org) => org.id === organizationId) ??
      false
    );
  }

  isOwnOrganizationOrThrow(organizationId?: string) {
    const isOwn = this.isOwnOrganization(organizationId);
    if (!isOwn) {
      throw new ForbiddenException('Bu kliniği oluşturma yetkiniz yok');
    }
  }
}
