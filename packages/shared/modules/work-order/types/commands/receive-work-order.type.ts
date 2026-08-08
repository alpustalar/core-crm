import { z } from 'zod';
import { ReceiveWorkOrderSchema } from '../../schemas/commands';

export type ReceiveWorkOrder = z.infer<typeof ReceiveWorkOrderSchema>;
