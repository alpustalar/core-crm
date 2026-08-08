import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';

/////////////////////////////////////////
// PURCHASE ORDER ITEM SCHEMA
/////////////////////////////////////////

export const PurchaseOrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string().nullable(),
  description: z.string(),
  quantityOrdered: decimalSchema("Field 'quantityOrdered' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"),
  quantityReceived: decimalSchema("Field 'quantityReceived' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"),
  unitPrice: decimalSchema("Field 'unitPrice' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"),
  vatRate: z.number().int(),
  lineNet: decimalSchema("Field 'lineNet' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"),
  lineVat: decimalSchema("Field 'lineVat' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"),
  lineTotal: decimalSchema("Field 'lineTotal' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']"),
})

export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>

export default PurchaseOrderItemSchema;
