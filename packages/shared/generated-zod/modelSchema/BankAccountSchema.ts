import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'
import { BankAccountStatusSchema } from '../inputTypeSchemas/BankAccountStatusSchema'

/////////////////////////////////////////
// BANK ACCOUNT SCHEMA
/////////////////////////////////////////

export const BankAccountSchema = z.object({
  currency: CurrencySchema,
  status: BankAccountStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  name: z.string(),
  bankName: z.string(),
  iban: z.string().nullable(),
  accountNo: z.string().nullable(),
  openingBalance: z.instanceof(Prisma.Decimal, { message: "Field 'openingBalance' must be a Decimal. Location: ['Models', 'BankAccount']"}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type BankAccount = z.infer<typeof BankAccountSchema>

export default BankAccountSchema;
