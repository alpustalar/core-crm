import {
  FindPatientByContactFilter,
  FindPatientsFilter,
} from '@modules/crm/patient/domain/contracts/patient.contracts';
import { Patient } from '@shared';
import { Pagination } from '@shared/common';
import { Paginated } from '@common/interfaces/paginated.type';

export const PATIENT_QUERY_REPOSITORY = Symbol('IPatientQueryRepository');

export interface IPatientQueryRepository {
  findById(id: string): Promise<Patient | null>;
  findByContact(filter: FindPatientByContactFilter): Promise<Patient | null>;
  findByFirebaseUid(firebaseUid: string): Promise<Patient | null>;
  /** Hasta listesi — organizasyon kapsamlı, sayfalanmış. */
  findMany(
    filter: FindPatientsFilter,
    pagination: Pagination
  ): Promise<Paginated<Patient>>;
}
