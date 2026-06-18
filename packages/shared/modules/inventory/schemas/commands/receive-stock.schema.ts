import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

export const ReceiveStockSchema = z.object({
  productId: z.uuid(),
  supplierId: z.uuid().optional().nullable(),
  lotNumber: z.string().max(100).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  quantity: z.number().positive(),
  purchasePrice: z.number().min(0),
  currency: CurrencySchema,
  vatRate: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional().nullable(),
});
