import { z } from 'zod';

export const PaymentStatusSchema = z.enum(['PENDING','PARTIAL','COMPLETED','CANCELLED','REFUNDED','FAILED']);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`

export default PaymentStatusSchema;
