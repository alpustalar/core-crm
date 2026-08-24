import { Money } from '@src/domain/value-objects/money.vo';
import { TreatmentPackage } from '@shared';

export interface TreatmentPackageItemProps {
  treatmentId: string;
  count: number;
}

export interface CreateTreatmentPackageProps {
  id?: string;
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

export type TreatmentPackageWithRelations = TreatmentPackage & {
  items: Array<{ id: string; treatmentId: string; count: number }>;
  providers: Array<{ id: string; providerId: string }>;
};
