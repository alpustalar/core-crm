import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { LedgerTypeSchema } from '../inputTypeSchemas/LedgerTypeSchema'
import { LedgerSourceSchema } from '../inputTypeSchemas/LedgerSourceSchema'
import { LedgerCategorySchema } from '../inputTypeSchemas/LedgerCategorySchema'
import { LedgerStatusSchema } from '../inputTypeSchemas/LedgerStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// FINANCE LEDGER SCHEMA
/////////////////////////////////////////

export const FinanceLedgerSchema = z.object({
  type: LedgerTypeSchema,
  source: LedgerSourceSchema,
  category: LedgerCategorySchema,
  status: LedgerStatusSchema,
  currency: CurrencySchema,
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  patientId: z.string().nullable(),
  paymentId: z.string().nullable(),
  installmentId: z.string().nullable(),
  performedById: z.string().nullable(),
  amount: decimalSchema("Field 'amount' must be a Decimal. Location: ['Models', 'FinanceLedger']"),
  taxRate: z.number().int(),
  taxAmount: decimalSchema("Field 'taxAmount' must be a Decimal. Location: ['Models', 'FinanceLedger']"),
  description: z.string().nullable(),
  documentNo: z.string().nullable(),
  entryDate: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type FinanceLedger = z.infer<typeof FinanceLedgerSchema>

export default FinanceLedgerSchema;
