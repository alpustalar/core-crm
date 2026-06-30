import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/**
 * Döviz kuru sağlayıcısı. iyzico TRY ister; HotelBeds net/satış genelde EUR/USD olduğundan
 * iyzico linkinden önce satış tutarı TRY'ye çevrilir. v1 adapter statik env oranı okur
 * (canlı kur feed'i sonraki iterasyon). Kur bulunamazsa hata fırlatır → çağıran iyzico linkini
 * atlar, Stripe linki yine üretilir (graceful degrade).
 */
export const FX_RATE_PROVIDER = Symbol('IFxRateProvider');

export interface IFxRateProvider {
  /** `from` para birimindeki 1 birimin `to` cinsinden karşılığı (ör. EUR→TRY). */
  getRate(from: CurrencyType, to: CurrencyType): Promise<number>;
}
