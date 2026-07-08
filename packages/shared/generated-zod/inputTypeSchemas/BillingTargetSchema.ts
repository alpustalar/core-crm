import { z } from 'zod';

export const BillingTargetSchema = z.enum(['ORGANIZATION','CLINIC']);

export type BillingTargetType = `${z.infer<typeof BillingTargetSchema>}`

export default BillingTargetSchema;
