import { z } from 'zod';

/** Kasa oturumu kapatma (fiziki sayım tutarı). Fark entity'de hesaplanır. */
export const CloseCashSessionSchema = z.object({
  countedAmount: z.number().nonnegative(),
});
