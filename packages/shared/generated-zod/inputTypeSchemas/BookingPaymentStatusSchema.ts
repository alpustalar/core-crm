import { z } from 'zod';

export const BookingPaymentStatusSchema = z.enum(['PENDING','PAID','BOOKED','EXPIRED','FAILED','REFUNDED']);

export type BookingPaymentStatusType = `${z.infer<typeof BookingPaymentStatusSchema>}`

export default BookingPaymentStatusSchema;
