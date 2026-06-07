import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// PRODUCT BATCH SCHEMA
/////////////////////////////////////////

export const ProductBatchSchema = z.object({
  id: z.uuid(),
  productId: z.string(),
  clinicId: z.string(),
  supplierId: z.string().nullable(),
  lotNumber: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  quantity: z.instanceof(Prisma.Decimal, { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'ProductBatch']"}),
  purchasePrice: z.instanceof(Prisma.Decimal, { message: "Field 'purchasePrice' must be a Decimal. Location: ['Models', 'ProductBatch']"}),
  currency: z.string(),
  receivedAt: z.coerce.date(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductBatch = z.infer<typeof ProductBatchSchema>

export default ProductBatchSchema;
