import { Injectable } from '@nestjs/common';
import { BasePolicy } from '@modules/platform/policy/application/base.policy';

@Injectable()
export class ClinicPolicy extends BasePolicy {
  actorCanAccessTargetClinic(targetClinicId: string | undefined): boolean {
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
}
