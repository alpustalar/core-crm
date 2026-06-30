import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ActorContext } from '@common/interfaces';
import {
  AppointmentResponseGroup,
  AppointmentsResponseGroups,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export class AppointmentPolicy extends ClinicPolicy {
  constructor(actor: ActorContext) {
    super(actor);
  }

  // capability guard ile kullanılacak
  canScheduleAppointmentInClinic(clinicId: string | undefined): boolean {
    return this.actorCanAccessTargetClinic(clinicId);
  }

  getSerializationOptions(appointment: {
    patientId?: string | null;
    clinicId: string;
    providerId: string;
  }): { isGroupActive: boolean; groups: AppointmentResponseGroup[] } {
    const isSelf = !!(
      this.actor.patientId && appointment.patientId === this.actor.patientId
    );

    const isProvider = !!(
      this.actor.providerId && appointment.providerId === this.actor.providerId
    );
    const isAdmin = this.isSystemAdmin();

    const isSameClinic = this.actorCanAccessTargetClinic(appointment.clinicId);
    const isManager = this.actorCanManageTargetClinic(appointment.clinicId);

    const groups: AppointmentResponseGroup[] = [
      isSelf && AppointmentsResponseGroups.DATA_OWNER,
      isProvider && AppointmentsResponseGroups.PROVIDER,
      isManager && AppointmentsResponseGroups.MANAGEMENT,
      isManager && AppointmentsResponseGroups.FINANCIAL,
      isAdmin && AppointmentsResponseGroups.ADMIN,
    ].filter((group) => typeof group !== 'boolean');

    return {
      isGroupActive: !!(
        isManager ||
        isSameClinic ||
        isSelf ||
        isAdmin ||
        isProvider
      ),
      groups,
    };
  }

  canCancelOwnBooking(appointment: {
    patientId: string | null;
    patientEmail: string | null;
  }): boolean {
    if (appointment.patientId && this.actor.patientId) {
      return appointment.patientId === this.actor.patientId;
    }
    if (appointment.patientEmail) {
      return appointment.patientEmail === this.actor.email;
    }
    return false;
  }
}
