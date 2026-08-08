import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// JOURNAL LINE SCHEMA
/////////////////////////////////////////

export const JournalLineSchema = z.object({
  currency: CurrencySchema,
  originalCurrency: CurrencySchema.nullable(),
  id: z.string(),
  entryId: z.string(),
  accountId: z.string(),
  partyId: z.string().nullable(),
  debit: decimalSchema("Field 'debit' must be a Decimal. Location: ['Models', 'JournalLine']"),
  credit: decimalSchema("Field 'credit' must be a Decimal. Location: ['Models', 'JournalLine']"),
  originalDebit: decimalSchema("Field 'originalDebit' must be a Decimal. Location: ['Models', 'JournalLine']").nullable(),
  originalCredit: decimalSchema("Field 'originalCredit' must be a Decimal. Location: ['Models', 'JournalLine']").nullable(),
  fxRate: decimalSchema("Field 'fxRate' must be a Decimal. Location: ['Models', 'JournalLine']").nullable(),
  lineDesc: z.string().nullable(),
})

export type JournalLine = z.infer<typeof JournalLineSchema>

export default JournalLineSchema;
