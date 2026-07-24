import { z } from 'zod';
import CashMovementTypeSchema from '@shared/generated-zod/inputTypeSchemas/CashMovementTypeSchema';

/** Açık kasa oturumuna nakit giriş/çıkış hareketi. Yön, türden türetilir. */
export const RecordCashMovementSchema = z.object({
  type: CashMovementTypeSchema,
  amount: z.number().positive(),
  description: z.string().nullable().optional(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
});
