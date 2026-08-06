import { z } from 'zod';
import { SendWorkOrderSchema } from '../../schemas/commands';

export type SendWorkOrder = z.infer<typeof SendWorkOrderSchema>;
