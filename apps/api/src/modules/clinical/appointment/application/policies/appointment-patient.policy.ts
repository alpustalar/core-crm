import {
  AppointmentResponseGroup,
  AppointmentsResponseGroups,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { PatientActorContext } from '@common/interfaces';
import { PatientBasePolicy } from '@modules/platform/policy/patient/application/patient-base.policy';
import { Appointment } from '@shared';

export class AppointmentPatientPolicy extends PatientBasePolicy {
  constructor(actor: PatientActorContext) {
    super(actor);
  }

  getSerializationOptions(appointment: Appointment): {
    isGroupActive: boolean;
    groups: AppointmentResponseGroup[];
  } {
    const isSelf = this.isSelf(appointment);

    const groups = isSelf
      ? [AppointmentsResponseGroups.PATIENT_DATA_OWNER]
      : [];

    return {
      isGroupActive: groups.length > 0,
      groups,
    };
  }

  isSelf(appointment: Appointment) {
    if (appointment.patientId && this.actor.patientId) {
      return appointment.patientId === this.actor.patientId;
    }
    if (appointment.patientEmail) {
      return appointment.patientEmail === this.actor.organizationId;
    }
    if (appointment.patientPhone) {
      return appointment.patientPhone === this.actor.phone;
    }

    return false;
  }

  canCancelOwnBooking(appointment: Appointment): boolean {
    return this.isSelf(appointment);
  }
}
