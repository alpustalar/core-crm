import { TreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/treatment-package.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const TREATMENT_PACKAGE_COMMAND_REPO = Symbol(
  'ITreatmentPackageCommandRepository'
);

export type ITreatmentPackageCommandRepository =
  IBaseCommandRepository<TreatmentPackage>;
