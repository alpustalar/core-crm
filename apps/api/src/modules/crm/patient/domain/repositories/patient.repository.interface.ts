import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { FindPatientByContactFilter } from '@modules/crm/patient/domain/patient.contracts';

export const PATIENT_COMMAND_REPOSITORY = Symbol('IPatientCommandRepository');
export const PATIENT_QUERY_REPOSITORY = Symbol('IPatientQueryRepository');

export type IPatientCommandRepository = IBaseCommandRepository<Patient>;

export interface IPatientQueryRepository {
  find(id: string): Promise<Patient | null>;
  findByContact(filter: FindPatientByContactFilter): Promise<Patient | null>;
  findByFirebaseUid(firebaseUid: string): Promise<Patient | null>;
}
