import { z } from 'zod';

export const ReceiveStockSchema = z.object({
  productId: z.string().uuid(),
  supplierId: z.string().uuid().optional().nullable(),
  lotNumber: z.string().max(100).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  quantity: z.number().positive(),
  purchasePrice: z.number().min(0),
  currency: z.string().length(3).optional(),
  vatRate: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional().nullable(),
});
