/**
 * Sağlık turizmi (otel + transfer) satış komisyonu sağlayıcısı. Komisyon PLATFORM geliridir
 * (klinik değil) → oran klinik config'inden değil, platform-global ayardan okunur. Satış tutarı
 * `net × (1 + oran/100)` ile hesaplanır; oran tek noktada (initiate handler) uygulanır, böylece
 * AI araçları komisyonu hiç bilmez.
 */
export const SERVICE_FEE_PROVIDER = Symbol('IServiceFeeProvider');

export interface IServiceFeeProvider {
  /** Satış üzerine eklenecek komisyon yüzdesi (ör. 12.5). Tanımlı değilse 0. */
  getServiceFeePercent(): number;
}
