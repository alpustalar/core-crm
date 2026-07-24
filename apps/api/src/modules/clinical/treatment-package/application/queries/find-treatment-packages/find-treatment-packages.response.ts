import { QueryResponse } from '@shared/common/response/response.interface';
import { TreatmentPackage } from '@shared';

type TreatmentPackageWithRelations = TreatmentPackage & {
  items: Array<{ id: string; treatmentId: string; count: number }>;
  providers: Array<{ id: string; providerId: string }>;
};

export type FindTreatmentPackagesResponse = QueryResponse<
  TreatmentPackageWithRelations[]
>;
