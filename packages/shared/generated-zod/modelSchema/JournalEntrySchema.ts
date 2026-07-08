import { z } from 'zod';
import { JournalEntryStatusSchema } from '../inputTypeSchemas/JournalEntryStatusSchema'

/////////////////////////////////////////
// JOURNAL ENTRY SCHEMA
/////////////////////////////////////////

export const JournalEntrySchema = z.object({
  status: JournalEntryStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  periodId: z.string(),
  eventId: z.string().nullable(),
  reversedById: z.string().nullable(),
  performedById: z.string().nullable(),
  entryNo: z.bigint().nullable(),
  entryDate: z.coerce.date(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type JournalEntry = z.infer<typeof JournalEntrySchema>

export default JournalEntrySchema;
