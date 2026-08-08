import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';

/////////////////////////////////////////
// PURCHASE REQUEST ITEM SCHEMA
/////////////////////////////////////////

export const PurchaseRequestItemSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  productId: z.string().nullable(),
  description: z.string(),
  quantity: decimalSchema("Field 'quantity' must be a Decimal. Location: ['Models', 'PurchaseRequestItem']"),
  estimatedUnitPrice: decimalSchema("Field 'estimatedUnitPrice' must be a Decimal. Location: ['Models', 'PurchaseRequestItem']").nullable(),
  unit: z.string().nullable(),
})

export type PurchaseRequestItem = z.infer<typeof PurchaseRequestItemSchema>

export default PurchaseRequestItemSchema;
