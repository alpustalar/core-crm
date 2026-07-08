import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// PRODUCT USAGE SCHEMA
/////////////////////////////////////////

export const ProductUsageSchema = z.object({
  id: z.string(),
  productId: z.string(),
  clinicId: z.string(),
  batchId: z.string().nullable(),
  appointmentId: z.string().nullable(),
  usedByProviderId: z.string().nullable(),
  quantity: z.instanceof(Prisma.Decimal, { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'ProductUsage']"}),
  usedAt: z.coerce.date(),
  notes: z.string().nullable(),
  stockMovementId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductUsage = z.infer<typeof ProductUsageSchema>

export default ProductUsageSchema;
