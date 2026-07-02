import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/**
 * Döviz kuru sağlayıcısı. İki kullanım vardır:
 *  1) Ödeme linki (iyzico TRY ister; satış EUR/USD ise güncel kurla TRY'ye çevrilir).
 *  2) Muhasebe postingi (Model A) — yabancı işlem fonksiyonel paraya **işlem tarihindeki**
 *     kurla çevrilir (VUK: TCMB döviz alış kuru). Bunun için `asOf` geçilir.
 * Kur bulunamazsa hata fırlatır → çağıran graceful degrade eder (iyzico linkini atlar / posting
 * fallback sağlayıcıya düşer).
 */
export const FX_RATE_PROVIDER = Symbol('IFxRateProvider');

export interface IFxRateProvider {
  /**
   * `from` para birimindeki 1 birimin `to` cinsinden karşılığı (ör. EUR→TRY).
   * `asOf` verilirse o işlem tarihindeki kur (statutory); verilmezse güncel/en yakın kur.
   */
  getRate(from: CurrencyType, to: CurrencyType, asOf?: Date): Promise<number>;
}
