import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { BankStatementLineMatchStatusSchema } from '../inputTypeSchemas/BankStatementLineMatchStatusSchema'

/////////////////////////////////////////
// BANK STATEMENT LINE SCHEMA
/////////////////////////////////////////

export const BankStatementLineSchema = z.object({
  matchStatus: BankStatementLineMatchStatusSchema,
  id: z.string(),
  bankStatementId: z.string(),
  bankAccountId: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  transactionDate: z.coerce.date(),
  description: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'BankStatementLine']"}),
  balanceAfter: z.instanceof(Prisma.Decimal, { message: "Field 'balanceAfter' must be a Decimal. Location: ['Models', 'BankStatementLine']"}).nullable(),
  reference: z.string().nullable(),
  counterpartyName: z.string().nullable(),
  matchedRef: z.string().nullable(),
  matchNote: z.string().nullable(),
  reconciledById: z.string().nullable(),
  reconciledAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type BankStatementLine = z.infer<typeof BankStatementLineSchema>

export default BankStatementLineSchema;
