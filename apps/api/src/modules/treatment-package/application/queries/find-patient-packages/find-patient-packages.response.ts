import { PatientTreatmentPackage } from '@prisma/client';

export interface FindPatientPackagesResponse {
  items: PatientTreatmentPackage[];
  total: number;
}
