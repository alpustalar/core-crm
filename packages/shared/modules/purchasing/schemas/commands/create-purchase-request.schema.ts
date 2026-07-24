import { z } from 'zod';

/** Satın alma talebi oluşturma. clinicId/organizationId/requestedById bağlamdan gelir. */
export const CreatePurchaseRequestSchema = z.object({
  neededBy: z.coerce.date().nullable().optional(),
  note: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.uuid().nullable().optional(),
        description: z.string().min(1),
        quantity: z.number().positive(),
        estimatedUnitPrice: z.number().nonnegative().nullable().optional(),
        unit: z.string().nullable().optional(),
      })
    )
    .min(1),
});
