import { z } from 'zod';

export const BookingPaymentProviderSchema = z.enum(['IYZICO','STRIPE']);

export type BookingPaymentProviderType = `${z.infer<typeof BookingPaymentProviderSchema>}`

export default BookingPaymentProviderSchema;
