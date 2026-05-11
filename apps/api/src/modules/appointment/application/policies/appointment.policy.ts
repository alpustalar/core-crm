import { ClinicPolicy } from '@modules/clinic/application/policies';
import { ActorContext } from '@common/interfaces';

export class AppointmentPolicy extends ClinicPolicy {
  constructor(actor: ActorContext) {
    super(actor);
  }

  // capability guard kullanımıyla yeterli
  canScheduleAppointmentInClinic(clinicId: string): boolean {
    return this.actorCanAccessTargetClinic(clinicId);
  }
}
