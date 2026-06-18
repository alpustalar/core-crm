import { PatientTreatmentPackage } from '@shared';

export interface FindPatientPackagesResponse {
  items: PatientTreatmentPackage[];
  total: number;
}
