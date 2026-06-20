import { z } from 'zod';
import { InvoiceStatusSchema } from '@input-type-schemas/InvoiceStatusSchema';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { InvoiceTriggers } from '@modules/finance/invoice/domain/constants/invoice-triggers';
import { Decimal } from 'decimal.js';

export const InvoiceTriggerSchema = z.nativeEnum(InvoiceTriggers);
export type InvoiceTrigger = z.infer<typeof InvoiceTriggerSchema>;

// ==========================================
// 2. INVOICE (FATURA) SÖZLEŞMELERİ
// ==========================================

export const CreateInvoiceSchema = z.object({
  id: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid(),
  appointmentId: z.uuid().nullable(),
  paymentId: z.uuid().nullable(),

  amount: z.number().positive("Fatura tutarı 0'dan büyük olmalıdır"),
  currency: CurrencySchema,
  vatRate: z.number().min(0),

  // Decimal türündeki mali hassas alanların CLAUDE.md zırhı:
  netTotal: z.custom<Decimal>((val) => val instanceof Decimal),
  vatTotal: z.custom<Decimal>((val) => val instanceof Decimal),

  status: InvoiceStatusSchema, // Orijinal fatura statü şeması

  invoiceNumber: z.string().optional(),
  issuedAt: z.date().optional(),
  providerRef: z.string().optional(),
  rawResponse: z.unknown().optional(),
});

export type CreateInvoiceProps = z.infer<typeof CreateInvoiceSchema>;
