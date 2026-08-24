import { Pagination, TreatmentPackage } from '@shared';
import { TreatmentPackageWithRelations } from '@modules/clinical/treatment-package/domain/contracts';

export const TREATMENT_PACKAGE_QUERY_REPO = Symbol(
  'ITreatmentPackageQueryRepository'
);

export interface ITreatmentPackageQueryRepository {
  findById(id: string): Promise<TreatmentPackage | null>;
  findMany(
    clinicId: string,
    pagination: Pagination,
    isActive?: boolean
  ): Promise<{ items: TreatmentPackageWithRelations[]; total: number }>;
}
