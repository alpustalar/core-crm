import { z } from 'zod';

export const PurchaseInvoiceStatusSchema = z.enum(['DRAFT','RECORDED','PAID','PARTIALLY_PAID','CANCELLED']);

export type PurchaseInvoiceStatusType = `${z.infer<typeof PurchaseInvoiceStatusSchema>}`

export default PurchaseInvoiceStatusSchema;
