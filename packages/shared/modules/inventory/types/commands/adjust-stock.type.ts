import { z } from 'zod';
import { AdjustStockSchema } from '../../schemas/commands';

export type AdjustStock = z.infer<typeof AdjustStockSchema>;
