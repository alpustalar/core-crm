import { Paginated } from '@common/interfaces/paginated.type';
import { PatientTreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/patient-treatment-package.entity';
import { Pagination } from '@shared';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PATIENT_TREATMENT_PACKAGE_COMMAND_REPO = Symbol(
  'IPatientTreatmentPackageCommandRepository'
);
export const PATIENT_TREATMENT_PACKAGE_QUERY_REPO = Symbol(
  'IPatientTreatmentPackageQueryRepository'
);

export type IPatientTreatmentPackageCommandRepository =
  IBaseCommandRepository<PatientTreatmentPackage>;

export interface IPatientTreatmentPackageQueryRepository {
  findById(id: string): Promise<PatientTreatmentPackage | null>;
  findManyByPatient(
    patientId: string,
    pagination: Pagination,
    status?: string
  ): Promise<Paginated<PatientTreatmentPackage>>;
}
