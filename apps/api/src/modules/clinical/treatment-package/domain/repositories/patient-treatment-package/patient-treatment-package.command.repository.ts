import { PatientTreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/patient-treatment-package.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PATIENT_TREATMENT_PACKAGE_COMMAND_REPO = Symbol(
  'IPatientTreatmentPackageCommandRepository'
);

export type IPatientTreatmentPackageCommandRepository =
  IBaseCommandRepository<PatientTreatmentPackage>;
