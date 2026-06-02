import { z } from 'zod';
import { GetStockMovementsSchema } from '../../schemas/queries';

export type GetStockMovements = z.infer<typeof GetStockMovementsSchema>;
