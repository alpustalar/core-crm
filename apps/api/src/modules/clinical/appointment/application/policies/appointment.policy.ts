import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ActorContext } from '@common/interfaces';
import {
  AppointmentResponseGroup,
  AppointmentsResponseGroups,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';
import { SerializationOptionsResponse } from '@common/interfaces/serialization-policy.interface';

export class AppointmentPolicy extends ClinicPolicy {
  constructor(actor: ActorContext, source: ExecutionSource) {
    super(actor, source);
  }

  canScheduleAppointmentInClinic(clinicId: string | undefined): boolean {
    return this.actorCanAccessTargetClinic(clinicId);
  }

  public getSerializationOptions(payload: {
    clinicId: string;
    providerId?: string;
  }): SerializationOptionsResponse<AppointmentResponseGroup> {
    const isProviderDataOwner = !!(
      this.actor.providerId && payload.providerId === this.actor.providerId
    );
    const isAdmin = this.isSystemAdmin();
    const isSameClinic = this.actorCanAccessTargetClinic(payload.clinicId);
    const isManager = this.actorCanManageTargetClinic(payload.clinicId);

    const { ADMIN, INTERNAL, FINANCIAL, MANAGEMENT, PROVIDER_DATA_OWNER } =
      AppointmentsResponseGroups;

    const groups: AppointmentResponseGroup[] = [];

    if (isSameClinic) groups.push(INTERNAL);
    if (isProviderDataOwner) groups.push(PROVIDER_DATA_OWNER);
    if (isManager) groups.push(MANAGEMENT, FINANCIAL);
    if (isAdmin) groups.push(ADMIN);

    return {
      isGroupActive:
        isManager || isSameClinic || isAdmin || isProviderDataOwner,
      groups,
    };
  }
}
