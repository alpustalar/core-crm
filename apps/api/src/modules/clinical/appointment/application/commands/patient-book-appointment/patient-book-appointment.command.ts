import { PatientBookAppointmentDto } from '@shared/modules/patients/dto/commands';

export interface PatientIdentity {
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
}

export class PatientBookAppointmentCommand {
  constructor(
    public readonly dto: PatientBookAppointmentDto,
    public readonly patient: PatientIdentity
  ) {}
}
