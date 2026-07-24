import { z } from 'zod';

/** Mal kabul — siparişin kalemlerinden teslim alınan miktarlar. */
export const ReceivePurchaseOrderSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.uuid(),
        quantity: z.number().positive(),
        lotNumber: z.string().nullable().optional(),
        expiresAt: z.coerce.date().nullable().optional(),
      })
    )
    .min(1),
});
