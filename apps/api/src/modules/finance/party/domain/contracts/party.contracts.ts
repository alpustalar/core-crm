import { z } from 'zod';
import { PartyTypeSchema } from '@input-type-schemas/PartyTypeSchema';
import { PartyRoleSchema } from '@input-type-schemas/PartyRoleSchema';
import { PartyOriginTypeSchema } from '@input-type-schemas/PartyOriginTypeSchema';

// ==========================================
// 1. SORGULAMA SÖZLEŞMELERİ (FILTERS)
// ==========================================

export const FindPartiesFilterSchema = z.object({
  organizationId: z.uuid(),
  role: PartyRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export type FindPartiesFilter = z.infer<typeof FindPartiesFilterSchema>;

// ==========================================
// 2. CARI / TARAF OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreatePartySchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),

  type: PartyTypeSchema, // Örn: INDIVIDUAL / LEGAL_ENTITY
  roles: z
    .array(PartyRoleSchema)
    .min(1, 'Cari kartın en az bir rolü olmalıdır'), // Örn: PATIENT, VENDOR, DOCTOR

  name: z.string().min(1, 'İsim veya Unvan alanı zorunludur'),
  taxNumber: z.string().nullable().optional(), // VKN/TCKN (Harici doğrulamalar için string kalmalıdır)
  nationalId: z.string().nullable().optional(),
  taxOffice: z.string().nullable().optional(),

  email: z.string().email('Geçersiz e-posta formatı').nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),

  isEInvoiceUser: z.boolean().optional(),
  eInvoiceMailbox: z.string().nullable().optional(),

  // Muhasebe Hesap Planı entegrasyonu için katı UUID kilitleri:
  receivableAccountId: z.uuid().nullable().optional(), // 120 Alıcılar hesabı karşılığı
  payableAccountId: z.uuid().nullable().optional(), // 320 Satıcılar hesabı karşılığı

  originType: PartyOriginTypeSchema, // Verinin kaynağı (Örn: PATIENT, STAFF, CORE)
  originId: z.uuid().nullable().optional(), // İlgili modüldeki (Örn: Hasta modülü) orijinal ID'si

  isActive: z.boolean().optional(),
});

export type CreatePartyProps = z.infer<typeof CreatePartySchema>;
