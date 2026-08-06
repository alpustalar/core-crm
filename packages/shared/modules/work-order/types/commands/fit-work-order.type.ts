import { z } from 'zod';
import { FitWorkOrderSchema } from '../../schemas/commands';

export type FitWorkOrder = z.infer<typeof FitWorkOrderSchema>;
