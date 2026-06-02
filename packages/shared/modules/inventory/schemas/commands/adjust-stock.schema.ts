import { z } from 'zod';

export const AdjustStockSchema = z.object({
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional().nullable(),
  quantityDelta: z.number().refine((v) => v !== 0, { message: 'Delta sıfır olamaz' }),
  notes: z.string().max(1000).optional().nullable(),
});
