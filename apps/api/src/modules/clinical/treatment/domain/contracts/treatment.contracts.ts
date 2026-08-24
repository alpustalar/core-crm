import { Decimal } from 'decimal.js';
import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';

/**
 * Tedavinin fiyatlandırma projeksiyonu — işlem satırı açılırken liste fiyatının
 * okunduğu okuma modeli. Tedavinin tamamı (çeviriler, kategori, süre) taşınmaz;
 * satırın ihtiyacı yalnız fiyat ve kapsam doğrulamasıdır.
 */
export interface TreatmentPricing {
  id: string;
  clinicId: string;
  listPrice: Decimal | null;
  currency: Currency;
  isActive: boolean;
}
