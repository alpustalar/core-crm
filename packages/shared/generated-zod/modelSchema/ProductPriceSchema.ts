import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { PriceTypeSchema } from '../inputTypeSchemas/PriceTypeSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// PRODUCT PRICE SCHEMA
/////////////////////////////////////////

export const ProductPriceSchema = z.object({
  type: PriceTypeSchema,
  currency: CurrencySchema,
  id: z.string(),
  productId: z.string(),
  clinicId: z.string().nullable(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'ProductPrice']"}),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().nullable(),
  createdById: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type ProductPrice = z.infer<typeof ProductPriceSchema>

export default ProductPriceSchema;
