import { z } from 'zod';
import { OpenRemakeWorkOrderSchema } from '../../schemas/commands';

export type OpenRemakeWorkOrder = z.infer<typeof OpenRemakeWorkOrderSchema>;
