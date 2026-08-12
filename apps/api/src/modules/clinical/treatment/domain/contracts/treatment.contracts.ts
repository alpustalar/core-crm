import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';

/**
 * Tedavinin fiyatlandırma projeksiyonu — işlem satırı açılırken liste fiyatının
 * okunduğu okuma modeli. Tedavinin tamamı (çeviriler, kategori, süre) taşınmaz;
 * satırın ihtiyacı yalnız fiyat ve kapsam doğrulamasıdır.
 */
export const TreatmentPricingSchema = z.object({
  id: z.uuid(),
  clinicId: z.uuid(),
  listPrice: z.instanceof(Decimal).nullable(),
  currency: CurrencySchema,
  isActive: z.boolean(),
});

export type TreatmentPricing = z.infer<typeof TreatmentPricingSchema>;
