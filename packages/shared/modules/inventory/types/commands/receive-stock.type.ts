import { z } from 'zod';
import { ReceiveStockSchema } from '../../schemas/commands';

export type ReceiveStock = z.infer<typeof ReceiveStockSchema>;
