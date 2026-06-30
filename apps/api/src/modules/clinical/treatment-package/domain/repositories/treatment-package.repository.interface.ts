import { Pagination } from '@shared';
import { TreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/treatment-package.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const TREATMENT_PACKAGE_COMMAND_REPO = Symbol(
  'ITreatmentPackageCommandRepository'
);
export const TREATMENT_PACKAGE_QUERY_REPO = Symbol(
  'ITreatmentPackageQueryRepository'
);

export interface ITreatmentPackageCommandRepository
  extends IBaseCommandRepository<TreatmentPackage> {}

export interface ITreatmentPackageQueryRepository {
  findById(id: string): Promise<TreatmentPackage | null>;
  findMany(
    clinicId: string,
    pagination: Pagination,
    isActive?: boolean
  ): Promise<{ items: TreatmentPackageWithRelations[]; total: number }>;
}

export type TreatmentPackageWithRelations = TreatmentPackage & {
  items: Array<{ id: string; treatmentId: string; count: number }>;
  providers: Array<{ id: string; providerId: string }>;
};
