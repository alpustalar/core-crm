import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

/**
 * Satıcıya yapılan ödeme — 320'deki cari borcu kapatır.
 *
 * Ayrı bir tablo tutulmaz: kalıcı kayıt `FinancialEvent`'in kendisidir
 * (append-only olay defteri). `reference` havale/dekont numarasıdır ve hem fiş
 * açıklamasına hem idempotency anahtarına girer.
 */
export const RecordSupplierPaymentSchema = z.object({
  clinicId: z.uuid(),
  /** Satıcı carisi (320 `requiresParty`). */
  partyId: z.uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Tutar 0.00 biçiminde olmalı'),
  currency: CurrencySchema.optional(),
  method: z.enum(['CASH', 'BANK_TRANSFER']),
  /** Ödeme tarihi; verilmezse şimdi. */
  paidAt: z.coerce.date().optional(),
  /** Havale/dekont referansı — aynı referans ikinci kez yazılmaz. */
  reference: z.string().min(1).max(120).optional(),
});
