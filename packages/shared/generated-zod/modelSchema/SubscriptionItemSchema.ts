import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { PlanIdSchema } from '../inputTypeSchemas/PlanIdSchema'

/////////////////////////////////////////
// SUBSCRIPTION ITEM SCHEMA
/////////////////////////////////////////

export const SubscriptionItemSchema = z.object({
  planId: PlanIdSchema.nullable(),
  id: z.uuid(),
  subscriptionId: z.string(),
  moduleId: z.string().nullable(),
  priceAtPurchase: z.instanceof(Prisma.Decimal, { message: "Field 'priceAtPurchase' must be a Decimal. Location: ['Models', 'SubscriptionItem']"}),
  externalPriceId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type SubscriptionItem = z.infer<typeof SubscriptionItemSchema>

export default SubscriptionItemSchema;
