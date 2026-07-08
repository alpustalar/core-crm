import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { PlanIdSchema } from '../inputTypeSchemas/PlanIdSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// SUBSCRIPTION ITEM SCHEMA
/////////////////////////////////////////

export const SubscriptionItemSchema = z.object({
  planId: PlanIdSchema.nullable(),
  currency: CurrencySchema,
  id: z.string(),
  subscriptionId: z.string(),
  moduleId: z.string().nullable(),
  externalPriceId: z.string().nullable(),
  priceAtPurchase: z.instanceof(Prisma.Decimal, { message: "Field 'priceAtPurchase' must be a Decimal. Location: ['Models', 'SubscriptionItem']"}),
  createdAt: z.coerce.date(),
})

export type SubscriptionItem = z.infer<typeof SubscriptionItemSchema>

export default SubscriptionItemSchema;
