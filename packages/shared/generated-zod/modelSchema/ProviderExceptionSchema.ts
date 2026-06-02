import { z } from 'zod';
import { ExceptionTypeSchema } from '../inputTypeSchemas/ExceptionTypeSchema'

/////////////////////////////////////////
// PROVIDER EXCEPTION SCHEMA
/////////////////////////////////////////

export const ProviderExceptionSchema = z.object({
  type: ExceptionTypeSchema,
  id: z.uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  reason: z.string().nullable(),
  providerId: z.string(),
  createdAt: z.coerce.date(),
})

export type ProviderException = z.infer<typeof ProviderExceptionSchema>

export default ProviderExceptionSchema;
