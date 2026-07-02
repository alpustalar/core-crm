import { z } from 'zod';
import { Decimal } from 'decimal.js';

export const CreateJournalEntryLineInputSchema = z.object({
  accountId: z.uuid(),
  partyId: z.uuid().nullable().optional(), // Cari, personel veya alt kırılım ID'si

  debit: z
    .custom<
      string | Decimal
    >((val) => typeof val === 'string' || val instanceof Decimal)
    .optional(),
  credit: z
    .custom<
      string | Decimal
    >((val) => typeof val === 'string' || val instanceof Decimal)
    .optional(),

  // currency = satırın fonksiyonel (defter) para birimi. debit/credit bu cinstendir.
  currency: z.string().optional(),

  // Yabancı para izlenebilirliği — yalnız çevrilmiş satırlarda dolu (Model A).
  // original* = işlemin orijinal para birimindeki tutarı; fxRate = orijinal→fonksiyonel kuru.
  originalDebit: z
    .custom<
      string | Decimal
    >((val) => typeof val === 'string' || val instanceof Decimal)
    .nullable()
    .optional(),
  originalCredit: z
    .custom<
      string | Decimal
    >((val) => typeof val === 'string' || val instanceof Decimal)
    .nullable()
    .optional(),
  originalCurrency: z.string().nullable().optional(),
  fxRate: z
    .custom<
      string | Decimal
    >((val) => typeof val === 'string' || val instanceof Decimal)
    .nullable()
    .optional(),

  lineDesc: z.string().nullable().optional(),
});
export type CreateJournalEntryLineProps = z.infer<
  typeof CreateJournalEntryLineInputSchema
>;

export const CreateJournalEntrySchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(), // defter sahibi şube (source-of-truth)
  organizationId: z.uuid(), // denormalize — konsolide raporlama
  periodId: z.uuid(), // İlgili mali dönem ID'si
  entryDate: z.date(),
  description: z.string().nullable().optional(),
  eventId: z.uuid().nullable().optional(),
  performedById: z.uuid().nullable().optional(),

  // Alt satırlar dizisi (Katı şema kontrolüyle):
  lines: z
    .array(CreateJournalEntryLineInputSchema)
    .min(1, 'Bir yevmiye fişinde en az 1 satır bulunmalıdır'),
});
export type CreateJournalEntryProps = z.infer<typeof CreateJournalEntrySchema>;

/**
 * Storno (ters kayıt) taslağı üretmek için gereken veriler. Storno yeni bir fiştir;
 * kendi dönemine + numara akışına girer, eventId taşımaz.
 */
export const BuildReversalDraftSchema = z.object({
  reversalId: z.uuid(),
  periodId: z.uuid(),
  entryDate: z.date(),
  description: z.string().nullable().optional(),
  performedById: z.uuid().nullable().optional(),
});

export type BuildReversalDraftProps = z.infer<typeof BuildReversalDraftSchema>;
