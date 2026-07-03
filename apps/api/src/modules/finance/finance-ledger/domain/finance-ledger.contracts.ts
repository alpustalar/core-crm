import { z } from 'zod';
import { LedgerSourceSchema } from '@input-type-schemas/LedgerSourceSchema';
import { LedgerTypeSchema } from '@input-type-schemas/LedgerTypeSchema';
import { LedgerCategorySchema } from '@input-type-schemas/LedgerCategorySchema';
import { Money } from '@src/domain/value-objects/money.vo';

// ==========================================
// (DEFTER HAREKETİ) SÖZLEŞMELERİ
// ==========================================

export const CreateFinanceLedgerSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid().nullable().optional(),
  paymentId: z.uuid().nullable().optional(),
  installmentId: z.uuid().nullable().optional(),
  performedById: z.uuid().nullable().optional(),

  type: LedgerTypeSchema, // Örn: DEBIT / CREDIT
  source: LedgerSourceSchema, // Örn: PATIENT_PAYMENT, INVOICE
  category: LedgerCategorySchema, // Örn: TREATMENT, INVENTORY

  money: z.custom<Money>((val) => val instanceof Money),

  taxRate: z.number().optional(),
  description: z.string().optional(),
  documentNo: z.string().optional(),
  entryDate: z.date().optional(),
});

export type CreateFinanceLedgerProps = z.infer<
  typeof CreateFinanceLedgerSchema
>;
