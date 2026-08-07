import { z } from 'zod';
import { FinancialEventTypeSchema } from '@input-type-schemas/FinancialEventTypeSchema';
import { InputJsonValueSchema } from '@input-type-schemas/InputJsonValueSchema';

// ==========================================
// 1. SORGULAMA SÖZLEŞMELERİ (FILTERS)
// ==========================================

export const FindFinancialEventsFilterSchema = z.object({
  organizationId: z.uuid(),
  type: FinancialEventTypeSchema.optional(),
  sourceModule: z.string().optional(),
  sourceRefId: z.string().optional(), // Kaynak ID'ler harici sistemlerden (Örn: Meta, Stripe) gelebileceği için z.string()
});

export type FindFinancialEventsFilter = z.infer<
  typeof FindFinancialEventsFilterSchema
>;

// ==========================================
// 2. KAYIT SÖZLEŞMELERİ (PROPS)
// ==========================================

export const RecordFinancialEventSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(), // defter sahibi şube (source-of-truth)
  organizationId: z.uuid(), // denormalize — konsolide raporlama
  type: FinancialEventTypeSchema,
  occurredAt: z.date().optional(),

  // JSON payload için projedeki orijinal InputJsonValue şeması:
  payload: InputJsonValueSchema,

  sourceModule: z.string().min(1, 'Kaynak modül belirtilmelidir'),
  sourceRefId: z.string().nullable().optional(),
  dedupeKey: z.string().nullable().optional(),
  performedById: z.uuid().nullable().optional(), // İşlemi yapan kullanıcı ID'si
});

export type RecordFinancialEventProps = z.infer<
  typeof RecordFinancialEventSchema
>;
