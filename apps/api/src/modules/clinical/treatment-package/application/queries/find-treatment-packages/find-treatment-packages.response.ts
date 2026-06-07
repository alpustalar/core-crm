import { TreatmentPackageWithRelations } from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';

export interface FindTreatmentPackagesResponse {
  items: TreatmentPackageWithRelations[];
  total: number;
}
