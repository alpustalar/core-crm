import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// PURCHASE REQUEST ITEM SCHEMA
/////////////////////////////////////////

export const PurchaseRequestItemSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  productId: z.string().nullable(),
  description: z.string(),
  quantity: z.instanceof(Prisma.Decimal, { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'PurchaseRequestItem']"}),
  estimatedUnitPrice: z.instanceof(Prisma.Decimal, { message: "Field 'estimatedUnitPrice' must be a Decimal. Location: ['Models', 'PurchaseRequestItem']"}).nullable(),
  unit: z.string().nullable(),
})

export type PurchaseRequestItem = z.infer<typeof PurchaseRequestItemSchema>

export default PurchaseRequestItemSchema;
