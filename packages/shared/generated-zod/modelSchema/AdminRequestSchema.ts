import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { AdminRequestTypeSchema } from '../inputTypeSchemas/AdminRequestTypeSchema'
import { AdminRequestStatusSchema } from '../inputTypeSchemas/AdminRequestStatusSchema'

/////////////////////////////////////////
// ADMIN REQUEST SCHEMA
/////////////////////////////////////////

export const AdminRequestSchema = z.object({
  type: AdminRequestTypeSchema,
  status: AdminRequestStatusSchema,
  id: z.uuid(),
  targetId: z.string(),
  requestedBy: z.string(),
  organizationId: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  reviewedBy: z.string().nullable(),
  reviewedAt: z.coerce.date().nullable(),
  reviewNote: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AdminRequest = z.infer<typeof AdminRequestSchema>

export default AdminRequestSchema;
