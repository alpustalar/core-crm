import { Organization } from '@shared';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';

export class OrganizationEntity implements Organization {
  id: string;
  status: GlobalStatusType;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // --- Domain Logic & Computed Properties ---

  /**
   * Organizasyonun silinip silinmediğini kontrol eder.
   */
  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Organizasyonun operasyonel olarak aktif olup olmadığını kontrol eder.
   */
  get isActive(): boolean {
    return this.status === 'ACTIVE' && !this.isDeleted;
  }
}
