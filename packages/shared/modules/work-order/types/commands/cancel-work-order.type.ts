import { z } from 'zod';
import { CancelWorkOrderSchema } from '../../schemas/commands';

export type CancelWorkOrder = z.infer<typeof CancelWorkOrderSchema>;
