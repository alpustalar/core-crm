import { z } from 'zod';
import { BillingTargetSchema } from '../inputTypeSchemas/BillingTargetSchema'
import { SubStatusSchema } from '../inputTypeSchemas/SubStatusSchema'

/////////////////////////////////////////
// SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const SubscriptionSchema = z.object({
  billingTarget: BillingTargetSchema,
  status: SubStatusSchema,
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string().nullable(),
  externalId: z.string().nullable(),
  trialEndsAt: z.coerce.date().nullable(),
  currentPeriodStart: z.coerce.date().nullable(),
  currentPeriodEnd: z.coerce.date().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Subscription = z.infer<typeof SubscriptionSchema>

export default SubscriptionSchema;
