import { z } from 'zod';
import { CreatePaymentSchema } from '../schemas/create-payment.schema';

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
