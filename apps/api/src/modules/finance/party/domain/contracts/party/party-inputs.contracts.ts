import type { PartyTypeType } from '@input-type-schemas/PartyTypeSchema';
import type { PartyRoleType } from '@input-type-schemas/PartyRoleSchema';
import type { PartyOriginTypeType } from '@input-type-schemas/PartyOriginTypeSchema';

// ==========================================
// CARI / TARAF OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export interface CreatePartyProps {
  id?: string;
  clinicId: string;
  organizationId: string;

  type: PartyTypeType; // Örn: INDIVIDUAL / LEGAL_ENTITY
  roles: PartyRoleType[]; // Örn: PATIENT, VENDOR, DOCTOR

  name: string;
  taxNumber?: string | null; // VKN/TCKN (Harici doğrulamalar için string kalmalıdır)
  nationalId?: string | null;
  taxOffice?: string | null;

  email?: string | null;
  phone?: string | null;
  address?: string | null;

  isEInvoiceUser?: boolean;
  eInvoiceMailbox?: string | null;

  // Muhasebe Hesap Planı entegrasyonu için katı UUID kilitleri:
  receivableAccountId?: string | null; // 120 Alıcılar hesabı karşılığı
  payableAccountId?: string | null; // 320 Satıcılar hesabı karşılığı

  originType: PartyOriginTypeType; // Verinin kaynağı (Örn: PATIENT, STAFF, CORE)
  originId?: string | null; // İlgili modüldeki (Örn: Hasta modülü) orijinal ID'si

  isActive?: boolean;
}
