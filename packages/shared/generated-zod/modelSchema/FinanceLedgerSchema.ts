import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { LedgerTypeSchema } from '../inputTypeSchemas/LedgerTypeSchema'
import { LedgerSourceSchema } from '../inputTypeSchemas/LedgerSourceSchema'
import { LedgerCategorySchema } from '../inputTypeSchemas/LedgerCategorySchema'
import { LedgerStatusSchema } from '../inputTypeSchemas/LedgerStatusSchema'

/////////////////////////////////////////
// FINANCE LEDGER SCHEMA
/////////////////////////////////////////

export const FinanceLedgerSchema = z.object({
  type: LedgerTypeSchema,
  source: LedgerSourceSchema,
  category: LedgerCategorySchema,
  status: LedgerStatusSchema,
  id: z.uuid(),
  clinicId: z.string(),
  patientId: z.string().nullable(),
  paymentId: z.string().nullable(),
  performedById: z.string().nullable(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'FinanceLedger']"}),
  currency: z.string(),
  taxRate: z.number().int(),
  taxAmount: z.instanceof(Prisma.Decimal, { message: "Field 'taxAmount' must be a Decimal. Location: ['Models', 'FinanceLedger']"}),
  description: z.string().nullable(),
  documentNo: z.string().nullable(),
  entryDate: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type FinanceLedger = z.infer<typeof FinanceLedgerSchema>

export default FinanceLedgerSchema;
