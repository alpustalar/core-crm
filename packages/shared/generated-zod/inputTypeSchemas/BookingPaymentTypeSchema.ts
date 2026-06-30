import { z } from 'zod';

export const BookingPaymentTypeSchema = z.enum(['HOTEL','TRANSFER']);

export type BookingPaymentTypeType = `${z.infer<typeof BookingPaymentTypeSchema>}`

export default BookingPaymentTypeSchema;
