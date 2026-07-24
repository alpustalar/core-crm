import { z } from 'zod';

export const PurchaseOrderStatusSchema = z.enum(['DRAFT','SENT','PARTIALLY_RECEIVED','RECEIVED','CANCELLED']);

export type PurchaseOrderStatusType = `${z.infer<typeof PurchaseOrderStatusSchema>}`

export default PurchaseOrderStatusSchema;
