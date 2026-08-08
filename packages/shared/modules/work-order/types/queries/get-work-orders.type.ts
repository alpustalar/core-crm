import { z } from 'zod';
import { GetWorkOrdersSchema } from '../../schemas/queries';

export type GetWorkOrders = z.infer<typeof GetWorkOrdersSchema>;
