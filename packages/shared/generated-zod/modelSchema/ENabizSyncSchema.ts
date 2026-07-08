import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { ENabizSyncStatusSchema } from '../inputTypeSchemas/ENabizSyncStatusSchema'

/////////////////////////////////////////
// E NABIZ SYNC SCHEMA
/////////////////////////////////////////

export const ENabizSyncSchema = z.object({
  status: ENabizSyncStatusSchema,
  id: z.string(),
  appointmentId: z.string(),
  referenceNo: z.string().nullable(),
  submittedAt: z.coerce.date().nullable(),
  lastAttemptAt: z.coerce.date().nullable(),
  attemptCount: z.number().int(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  rawRequest: JsonValueSchema.nullable(),
  rawResponse: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ENabizSync = z.infer<typeof ENabizSyncSchema>

export default ENabizSyncSchema;
