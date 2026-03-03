import { Injectable } from '@nestjs/common';
import { UserPolicy } from '@modules/user/policies';

@Injectable()
export class ClinicPolicy extends UserPolicy {
  canAccessClinic(clinicId: string): boolean {
    if (this.isSystemAdmin()) return true;
    return this.actor.clinicId === clinicId;
  }

  canManageClinic(clinicId: string) {
    if (this.isSystemAdmin()) return true;
    return this.isTargetInMyClinicForManage({ clinicId });
  }

  /**
   * Yeni klinik oluştururken organizasyon kısıtı
   */
  getOrganizationFilter(organizationId?: string) {
    if (!organizationId) return undefined;
    if (this.isSystemAdmin()) return { id: organizationId };

    return {
      id: organizationId,
      organizationOwners: { some: { id: this.actor.userId } },
    };
  }
}
