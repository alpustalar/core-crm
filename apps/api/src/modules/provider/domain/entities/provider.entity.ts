import {
  Clinic,
  ProviderSpecialty,
  ProviderTitle,
  Sector,
  User,
} from '@shared';

export class ProviderEntity {
  id: string;
  isActive: boolean;
  publicPhone: string | null;
  publicEmail: string | null;
  clinicId: string;
  userId: string;
  sectorId: string | null;
  providerTitleId: string | null;
  providerSpecialtyId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  clinic: Clinic;
  user: User;
  sector: Sector | null;
  title: ProviderTitle | null;
  specialty: ProviderSpecialty | null;

  get isDeleted(): boolean {
    return !this.isActive;
  }

  get displayName(): string {
    return this.user.displayName;
  }
}
