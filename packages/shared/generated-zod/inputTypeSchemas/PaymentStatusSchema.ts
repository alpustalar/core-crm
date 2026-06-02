import { z } from 'zod';

export const PaymentStatusSchema = z.enum(['PENDING','COMPLETED','CANCELLED','REFUNDED','FAILED']);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`

export default PaymentStatusSchema;
