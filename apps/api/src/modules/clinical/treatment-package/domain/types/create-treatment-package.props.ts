export interface TreatmentPackageItemProps {
  treatmentId: string;
  count: number;
}

export interface CreateTreatmentPackageProps {
  clinicId: string;
  name: string;
  examinationCount: number;
  controlCount: number;
  validityDays: number;
  price: number;
  providerIds?: string[];
  items?: TreatmentPackageItemProps[];
}
