import { Injectable } from '@nestjs/common';
import { UserPolicy } from '@modules/user/application/policies';

@Injectable()
export class ClinicPolicy extends UserPolicy {
  canAccessClinic(clinicId: string): boolean {
    return this.actor.clinicId === clinicId;
  }

  canManageClinic(clinicId: string): boolean {
    return this.isTargetInMyClinicForManage({ clinicId });
  }
}
