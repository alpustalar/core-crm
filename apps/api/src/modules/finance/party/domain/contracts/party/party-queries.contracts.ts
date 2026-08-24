import type { PartyRoleType } from '@input-type-schemas/PartyRoleSchema';

// ==========================================
// SORGULAMA SÖZLEŞMELERİ (FILTERS)
// ==========================================

export interface FindPartiesFilter {
  organizationId: string;
  role?: PartyRoleType;
  isActive?: boolean;
}
