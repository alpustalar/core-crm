import { FindOrCreatePatientForAuth } from '@shared/modules/patients/types/queries';
import { Patient } from '@modules/patient/domain/entities/patient.entity';

export const PATIENT_REPOSITORY = Symbol('IPatientRepository');

export interface FindPatientByContactProps {
  clinicId: string;
  phone?: string | null;
  email?: string | null;
}

export interface IPatientRepository {
  find(id: string): Promise<Patient | null>;
  findOrCreateByPhone(dto: FindOrCreatePatientForAuth): Promise<Patient>;
  save(entity: Patient): Promise<void>;
  findByContact(props: FindPatientByContactProps): Promise<Patient | null>;
}
