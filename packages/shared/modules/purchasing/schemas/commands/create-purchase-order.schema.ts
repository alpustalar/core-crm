import { z } from 'zod';

/** Satın alma siparişi oluşturma (doğrudan veya onaylı talepten). */
export const CreatePurchaseOrderSchema = z.object({
  supplierId: z.uuid(),
  purchaseRequestId: z.uuid().nullable().optional(),
  expectedDate: z.coerce.date().nullable().optional(),
  note: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.uuid().nullable().optional(),
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        vatRate: z.number().int().min(0).max(100).optional(),
      })
    )
    .min(1),
});
