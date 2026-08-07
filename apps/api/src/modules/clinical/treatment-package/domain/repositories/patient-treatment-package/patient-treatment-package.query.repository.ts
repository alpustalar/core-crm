import { Paginated } from '@common/interfaces/paginated.type';
import { Pagination, PatientTreatmentPackage } from '@shared';

export const PATIENT_TREATMENT_PACKAGE_QUERY_REPO = Symbol(
  'IPatientTreatmentPackageQueryRepository'
);

export interface IPatientTreatmentPackageQueryRepository {
  findById(id: string): Promise<PatientTreatmentPackage | null>;
  findManyByPatient(
    patientId: string,
    pagination: Pagination,
    status?: string
  ): Promise<Paginated<PatientTreatmentPackage>>;
}
