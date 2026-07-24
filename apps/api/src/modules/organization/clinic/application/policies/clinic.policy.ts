import { Injectable } from '@nestjs/common';
import { BasePolicy } from '@modules/platform/policy/staff/application/base.policy';
import { OrganizationPolicy } from '@modules/organization/organization/application/policies/organization.policy';
import { SerializationOptionsResponse } from '@common/interfaces/serialization-policy.interface';
import {
  ResponseGroup,
  ResponseGroups,
} from '@common/constants/response-groups.constant';

@Injectable()
export class ClinicPolicy extends BasePolicy {
  actorCanAccessClinicAndOrganization(
    targetClinicId: string,
    targetOrganizationId: string
  ): boolean {
    const hasClinicAccess = this.actorCanAccessTargetClinic(targetClinicId);

    const organizationPolicy = new OrganizationPolicy(this.actor, this.source);

    const hasOrgAccess =
      organizationPolicy.actorCanAccessTargetOrganization(targetOrganizationId);

    return hasClinicAccess && hasOrgAccess;
  }

  actorCanAccessTargetClinic(targetClinicId: string | undefined): boolean {
    if (this.actorCanManageTargetClinic(targetClinicId)) return true;
    if (!targetClinicId || !this.actor.clinicId) return false;
    return this.actor.clinicId === targetClinicId;
  }

  actorCanManageTargetClinic(
    targetClinicId: string | undefined | null
  ): boolean {
    if (!targetClinicId) return false;
    return !!this.actor.managedClinics?.some(
      (clinic) => clinic.id === targetClinicId
    );
  }

  /**
   * Alt policy'ler kendi imzalarıyla override eder (ör. UserPolicy, AppointmentPolicy,
   * PatientPolicy — farklı payload/grup tipleriyle). Taban imza kasıtlı olarak geniştir:
   * değişken sayıda argüman + `string` grup — böylece farklı sayıda/tipte parametreyle
   * yapılan override'lar geçerli kalır ve taban yine argümansız çağrılabilir
   * (ör. ClinicPolicy'nin doğrudan kullanımı: inventory).
   *
   * Varsayılan gövde `clinicId` payload'ı verilirse klinik-bazlı grupları üretir.
   */
  getSerializationOptions(...args: unknown[]): SerializationOptionsResponse {
    const payload = (args[0] ?? {}) as { clinicId?: string };
    const isSameClinic = this.actorCanAccessTargetClinic(payload.clinicId);
    const isManager = this.actorCanManageTargetClinic(payload.clinicId);
    const isSystem = this.isSystem();

    const { ADMIN, INTERNAL, FINANCIAL, MANAGEMENT } = ResponseGroups;

    const groups: ResponseGroup[] = [];

    if (isSameClinic) groups.push(INTERNAL);
    if (isManager) groups.push(MANAGEMENT, FINANCIAL);
    if (isSystem) groups.push(ADMIN);

    return {
      isGroupActive: isSameClinic || isManager || isSystem,
      groups,
    };
  }
}
