import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { FinancialEventTypeSchema } from '../inputTypeSchemas/FinancialEventTypeSchema'

/////////////////////////////////////////
// FINANCIAL EVENT SCHEMA
/////////////////////////////////////////

export const FinancialEventSchema = z.object({
  type: FinancialEventTypeSchema,
  id: z.uuid(),
  clinicId: z.string(),
  organizationId: z.string(),
  occurredAt: z.coerce.date(),
  payload: JsonValueSchema,
  sourceModule: z.string(),
  sourceRefId: z.string().nullable(),
  dedupeKey: z.string().nullable(),
  performedById: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type FinancialEvent = z.infer<typeof FinancialEventSchema>

export default FinancialEventSchema;
