import { z } from 'zod';

/** Talep onay/ret notu (opsiyonel). */
export const ReviewPurchaseRequestSchema = z.object({
  note: z.string().nullable().optional(),
});
