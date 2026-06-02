import { z } from 'zod';
import { RefundPaymentSchema } from '../schemas';

export type RefundPayment = z.infer<typeof RefundPaymentSchema>;
