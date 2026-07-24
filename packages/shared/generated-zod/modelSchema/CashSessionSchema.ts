import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CashSessionStatusSchema } from '../inputTypeSchemas/CashSessionStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// CASH SESSION SCHEMA
/////////////////////////////////////////

export const CashSessionSchema = z.object({
  status: CashSessionStatusSchema,
  currency: CurrencySchema,
  id: z.string(),
  cashRegisterId: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  openingFloat: z.instanceof(Prisma.Decimal, { message: "Field 'openingFloat' must be a Decimal. Location: ['Models', 'CashSession']"}),
  expectedAmount: z.instanceof(Prisma.Decimal, { message: "Field 'expectedAmount' must be a Decimal. Location: ['Models', 'CashSession']"}).nullable(),
  countedAmount: z.instanceof(Prisma.Decimal, { message: "Field 'countedAmount' must be a Decimal. Location: ['Models', 'CashSession']"}).nullable(),
  difference: z.instanceof(Prisma.Decimal, { message: "Field 'difference' must be a Decimal. Location: ['Models', 'CashSession']"}).nullable(),
  openedById: z.string(),
  closedById: z.string().nullable(),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date().nullable(),
  accountingEventId: z.string().nullable(),
  postedToAccountingAt: z.coerce.date().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CashSession = z.infer<typeof CashSessionSchema>

export default CashSessionSchema;
