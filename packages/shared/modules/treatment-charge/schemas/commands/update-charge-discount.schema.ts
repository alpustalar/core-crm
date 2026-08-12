import { z } from 'zod';

/**
 * Mevcut satırın indirimini değiştirir. Liste fiyatı ve KDV oranı değişmez —
 * onlar satır oluşurken donmuştur; pazarlık payı yalnız indirimdir.
 */
export const UpdateChargeDiscountSchema = z.object({
  discountRate: z.coerce.number().min(0).max(100),
  discountReason: z.string().max(300).nullable().optional(),
});
