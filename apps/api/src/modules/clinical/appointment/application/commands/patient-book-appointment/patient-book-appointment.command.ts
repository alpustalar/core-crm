import { IGetPatientContext } from '@common/decorators';
import { PatientBookAppointment } from '@shared';

export interface PatientIdentity {
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
}

export class PatientBookAppointmentCommand {
  constructor(
    public readonly payload: {
      readonly data: PatientBookAppointment;
      readonly patient: PatientIdentity;
      readonly ctx: IGetPatientContext;
    }
  ) {}
}
