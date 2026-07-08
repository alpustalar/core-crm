import { z } from 'zod';
import { ExceptionTypeSchema } from '../inputTypeSchemas/ExceptionTypeSchema'

/////////////////////////////////////////
// PROVIDER EXCEPTION SCHEMA
/////////////////////////////////////////

export const ProviderExceptionSchema = z.object({
  type: ExceptionTypeSchema,
  id: z.string(),
  providerId: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type ProviderException = z.infer<typeof ProviderExceptionSchema>

export default ProviderExceptionSchema;
