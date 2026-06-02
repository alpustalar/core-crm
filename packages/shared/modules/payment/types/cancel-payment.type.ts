import { z } from 'zod';
import { CancelPaymentSchema } from '../schemas';

export type CancelPayment = z.infer<typeof CancelPaymentSchema>;
