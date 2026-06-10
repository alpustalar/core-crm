import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// JOURNAL LINE SCHEMA
/////////////////////////////////////////

export const JournalLineSchema = z.object({
  id: z.uuid(),
  entryId: z.string(),
  accountId: z.string(),
  partyId: z.string().nullable(),
  debit: z.instanceof(Prisma.Decimal, { message: "Field 'debit' must be a Decimal. Location: ['Models', 'JournalLine']"}),
  credit: z.instanceof(Prisma.Decimal, { message: "Field 'credit' must be a Decimal. Location: ['Models', 'JournalLine']"}),
  currency: z.string(),
  lineDesc: z.string().nullable(),
})

export type JournalLine = z.infer<typeof JournalLineSchema>

export default JournalLineSchema;
