import { PatientBookAppointment } from '@shared';
import { IGetPatientContext } from '@common/decorators/get-patient-context.decorator';

export interface PatientIdentity {
  patientId: string;
  firstName: string;
  phone: string;
  email: string | null;
}

export class PatientBookAppointmentCommand {
  constructor(
    public readonly payload: {
      readonly data: PatientBookAppointment;
      readonly ctx: IGetPatientContext;
      readonly aiConversationPatient?: PatientIdentity;
    }
  ) {}
}
