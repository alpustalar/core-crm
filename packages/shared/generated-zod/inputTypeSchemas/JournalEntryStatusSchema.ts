import { z } from 'zod';

export const JournalEntryStatusSchema = z.enum(['DRAFT','POSTED','REVERSED']);

export type JournalEntryStatusType = `${z.infer<typeof JournalEntryStatusSchema>}`

export default JournalEntryStatusSchema;
