import { Money } from '@src/domain/value-objects/money.vo';

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
  price: Money;
  providerIds?: string[];
  items?: TreatmentPackageItemProps[];
}

export interface UpdateTreatmentPackageProps {
  name?: string;
  examinationCount?: number;
  controlCount?: number;
  validityDays?: number;
  price?: Money;
  isActive?: boolean;
  providerIds?: string[];
  items?: TreatmentPackageItemProps[];
}
