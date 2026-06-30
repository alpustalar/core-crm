import { QueryResponse } from '@shared/common/response/response.interface';
import { PatientTreatmentPackage } from '@shared';

export type FindPatientPackagesResponse = QueryResponse<
  PatientTreatmentPackage[]
>;
