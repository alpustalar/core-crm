import { z } from 'zod';
import { InitCheckoutFormSchema } from '../schemas';

export type InitCheckoutForm = z.infer<typeof InitCheckoutFormSchema>;
