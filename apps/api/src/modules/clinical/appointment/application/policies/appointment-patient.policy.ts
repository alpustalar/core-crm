import {
  AppointmentResponseGroup,
  AppointmentsResponseGroups,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { PatientActorContext } from '@common/interfaces';
import { PatientBasePolicy } from '@modules/platform/policy/patient/application/patient-base.policy';
import { Appointment } from '@shared';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';

export class AppointmentPatientPolicy extends PatientBasePolicy {
  constructor(actor: PatientActorContext, source: ExecutionSource) {
    super(actor, source);
  }

  getSerializationOptions(appointment: Appointment): {
    isGroupActive: boolean;
    groups: AppointmentResponseGroup[];
  } {
    const { PATIENT_DATA_OWNER, ADMIN } = AppointmentsResponseGroups;

    const groups: AppointmentResponseGroup[] = [];

    if (this.isSelf(appointment)) groups.push(PATIENT_DATA_OWNER);
    if (this.isSystem()) groups.push(ADMIN);

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
