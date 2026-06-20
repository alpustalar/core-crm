import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const PATIENT_REPOSITORY = Symbol('IPatientRepository');

export interface FindPatientByContactFilter {
  organizationId?: string;
  phone?: string | null;
  email?: string | null;
}

export const PATIENT_COMMAND_REPOSITORY = Symbol('IPatientCommandRepository');
export const PATIENT_QUERY_REPOSITORY = Symbol('IPatientQueryRepository');

export type IPatientCommandRepository = IBaseCommandRepository<Patient>;

export interface IPatientQueryRepository {
  find(id: string): Promise<Patient | null>;
  findByContact(filter: FindPatientByContactFilter): Promise<Patient | null>;
}
