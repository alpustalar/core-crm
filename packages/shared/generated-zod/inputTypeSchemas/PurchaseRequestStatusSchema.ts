import { z } from 'zod';

export const PurchaseRequestStatusSchema = z.enum(['DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELLED','ORDERED']);

export type PurchaseRequestStatusType = `${z.infer<typeof PurchaseRequestStatusSchema>}`

export default PurchaseRequestStatusSchema;
