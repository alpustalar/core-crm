import { FindPatientByContactFilter } from '@modules/crm/patient/domain/contracts/patient.contracts';
import { Patient } from '@shared';

export const PATIENT_QUERY_REPOSITORY = Symbol('IPatientQueryRepository');

export interface IPatientQueryRepository {
  findById(id: string): Promise<Patient | null>;
  findByContact(filter: FindPatientByContactFilter): Promise<Patient | null>;
  findByFirebaseUid(firebaseUid: string): Promise<Patient | null>;
}
