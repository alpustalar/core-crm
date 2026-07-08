import { z } from 'zod';

export const PayoutTriggerSchema = z.enum(['ON_PAYMENT','ON_TREATMENT_COMPLETED']);

export type PayoutTriggerType = `${z.infer<typeof PayoutTriggerSchema>}`

export default PayoutTriggerSchema;
