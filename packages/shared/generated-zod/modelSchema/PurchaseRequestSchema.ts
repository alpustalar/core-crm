import { z } from 'zod';
import { PurchaseRequestStatusSchema } from '../inputTypeSchemas/PurchaseRequestStatusSchema'

/////////////////////////////////////////
// PURCHASE REQUEST SCHEMA
/////////////////////////////////////////

export const PurchaseRequestSchema = z.object({
  status: PurchaseRequestStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  requestedById: z.string(),
  neededBy: z.coerce.date().nullable(),
  note: z.string().nullable(),
  reviewedById: z.string().nullable(),
  reviewedAt: z.coerce.date().nullable(),
  reviewNote: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>

export default PurchaseRequestSchema;
