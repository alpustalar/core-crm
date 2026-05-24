import { Patient } from '@modules/patient/domain/entities/patient.entity';

export interface FindPatientByContactResponse {
  patient: Patient | null;
}
