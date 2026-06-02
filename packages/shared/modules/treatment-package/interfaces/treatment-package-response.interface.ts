export interface TreatmentPackageItemResponse {
  id: string;
  treatmentId: string;
  treatmentName?: string;
  count: number;
}

export interface TreatmentPackageProviderResponse {
  providerId: string;
  providerName?: string;
}

export interface TreatmentPackageResponse {
  id: string;
  clinicId: string;
  name: string;
  examinationCount: number;
  controlCount: number;
  validityDays: number;
  price: number;
  isActive: boolean;
  items: TreatmentPackageItemResponse[];
  providers: TreatmentPackageProviderResponse[];
  createdAt: Date;
  updatedAt: Date;
}
