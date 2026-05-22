import { TreatmentPackage } from '@prisma/client';
import { Pagination } from '@shared';
import { CreateTreatmentPackageProps } from '@modules/treatment-package/domain/types/create-treatment-package.props';

export const TREATMENT_PACKAGE_COMMAND_REPO = Symbol('ITreatmentPackageCommandRepository');
export const TREATMENT_PACKAGE_QUERY_REPO = Symbol('ITreatmentPackageQueryRepository');

export interface ITreatmentPackageCommandRepository {
  create(props: CreateTreatmentPackageProps): Promise<TreatmentPackage>;
  update(id: string, data: Partial<CreateTreatmentPackageProps>): Promise<TreatmentPackage>;
  softDelete(id: string): Promise<void>;
}

export interface ITreatmentPackageQueryRepository {
  findById(id: string): Promise<TreatmentPackageWithRelations | null>;
  findMany(clinicId: string, pagination: Pagination, isActive?: boolean): Promise<{ items: TreatmentPackageWithRelations[]; total: number }>;
}

export type TreatmentPackageWithRelations = TreatmentPackage & {
  items: Array<{ id: string; treatmentId: string; count: number }>;
  providers: Array<{ id: string; providerId: string }>;
};
