import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ActorContext } from '@common/interfaces';

export class AppointmentPolicy extends ClinicPolicy {
  constructor(actor: ActorContext) {
    super(actor);
  }

  // capability guard kullanımıyla yeterli
  canScheduleAppointmentInClinic(clinicId: string | undefined): boolean {
    return this.actorCanAccessTargetClinic(clinicId);
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
