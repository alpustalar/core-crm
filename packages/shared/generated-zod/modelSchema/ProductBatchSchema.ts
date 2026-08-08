import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// PRODUCT BATCH SCHEMA
/////////////////////////////////////////

export const ProductBatchSchema = z.object({
  currency: CurrencySchema,
  id: z.string(),
  productId: z.string(),
  clinicId: z.string(),
  supplierId: z.string().nullable(),
  lotNumber: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  quantity: decimalSchema("Field 'quantity' must be a Decimal. Location: ['Models', 'ProductBatch']"),
  purchasePrice: decimalSchema("Field 'purchasePrice' must be a Decimal. Location: ['Models', 'ProductBatch']"),
  receivedAt: z.coerce.date(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductBatch = z.infer<typeof ProductBatchSchema>

export default ProductBatchSchema;
