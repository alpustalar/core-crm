import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// OUTBOX SCHEMA
/////////////////////////////////////////

export const OutboxSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: JsonValueSchema,
  createdAt: z.coerce.date(),
  processedAt: z.coerce.date().nullable(),
})

export type Outbox = z.infer<typeof OutboxSchema>

export default OutboxSchema;
