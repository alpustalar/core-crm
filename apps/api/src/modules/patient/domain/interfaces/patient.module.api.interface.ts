import { FindOrCreatePatientProps } from '@modules/patient/domain/types/find-or-create-patient.props';
import { Patient } from '@shared';
import { QueryResponse } from '@shared/common/response/response.interface';

export const PATIENT_MODULE_API = Symbol('IPatientModuleApi');

export interface IPatientModuleApi {
  findPatientById(id: string): Promise<QueryResponse<Patient>>;
  findPatientByFirebaseUid(firebaseUid: string): Promise<Patient | null>;
  findOrCreatePatientForAuth(props: FindOrCreatePatientProps): Promise<Patient>;
}
