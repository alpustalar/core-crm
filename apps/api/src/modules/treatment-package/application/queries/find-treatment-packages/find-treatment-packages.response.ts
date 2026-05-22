import { TreatmentPackageWithRelations } from '@modules/treatment-package/domain/repositories/treatment-package.repository.interface';

export interface FindTreatmentPackagesResponse {
  items: TreatmentPackageWithRelations[];
  total: number;
}
