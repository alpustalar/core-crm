import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { PriceTypeSchema } from '../inputTypeSchemas/PriceTypeSchema'

/////////////////////////////////////////
// PRODUCT PRICE SCHEMA
/////////////////////////////////////////

export const ProductPriceSchema = z.object({
  type: PriceTypeSchema,
  id: z.uuid(),
  productId: z.string(),
  clinicId: z.string().nullable(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'ProductPrice']"}),
  currency: z.string(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().nullable(),
  createdById: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type ProductPrice = z.infer<typeof ProductPriceSchema>

export default ProductPriceSchema;
