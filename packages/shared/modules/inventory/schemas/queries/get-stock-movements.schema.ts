import { z } from 'zod';

export const GetStockMovementsSchema = z.object({
  productId: z.uuid().optional(),
});
