import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// PURCHASE ORDER ITEM SCHEMA
/////////////////////////////////////////

export const PurchaseOrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string().nullable(),
  description: z.string(),
  quantityOrdered: z.instanceof(Prisma.Decimal, { message: "Field 'quantityOrdered' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"}),
  quantityReceived: z.instanceof(Prisma.Decimal, { message: "Field 'quantityReceived' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"}),
  unitPrice: z.instanceof(Prisma.Decimal, { message: "Field 'unitPrice' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"}),
  vatRate: z.number().int(),
  lineNet: z.instanceof(Prisma.Decimal, { message: "Field 'lineNet' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"}),
  lineVat: z.instanceof(Prisma.Decimal, { message: "Field 'lineVat' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"}),
  lineTotal: z.instanceof(Prisma.Decimal, { message: "Field 'lineTotal' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"}),
})

export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>

export default PurchaseOrderItemSchema;
