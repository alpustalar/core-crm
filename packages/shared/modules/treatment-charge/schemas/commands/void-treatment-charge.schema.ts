import { z } from 'zod';

/**
 * Satırı iptal eder. Kayıt silinmez — ticari iz korunur, satır toplamlara
 * girmez hâle gelir.
 */
export const VoidTreatmentChargeSchema = z.object({
  reason: z.string().min(1).max(300),
});
