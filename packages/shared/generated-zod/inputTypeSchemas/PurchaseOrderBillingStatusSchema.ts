import { z } from 'zod';

export const PurchaseOrderBillingStatusSchema = z.enum(['NOT_BILLED','PARTIALLY_BILLED','FULLY_BILLED']);

export type PurchaseOrderBillingStatusType = `${z.infer<typeof PurchaseOrderBillingStatusSchema>}`

export default PurchaseOrderBillingStatusSchema;
