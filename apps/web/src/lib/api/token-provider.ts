/**
 * Token'ı `lib/api` değil, `lib/auth` biliyor. İstemci Firebase SDK'sını buraya
 * import etseydik iki sorun doğardı: (1) `lib/auth` → `lib/api` → `lib/auth`
 * döngüsü, (2) yalnız sunucuda çalışan kod yollarına Firebase Web SDK'sının
 * sürüklenmesi. Bunun yerine tarayıcı tarafı açılışta kendini kaydeder.
 */
export interface TokenProvider {
  /** `forceRefresh` yalnız 401 sonrası tek denemede true gelir. */
  getToken(forceRefresh?: boolean): Promise<string | null>;
  /** Yenileme de 401 yediğinde oturumu düşürmek için. */
  onUnauthorized?(): void | Promise<void>;
}

let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

/**
 * Sunucuda daima `null` döner — orada token istekle birlikte açıkça geçilir
 * (`options.token`). Modül düzeyinde tutulan bir sunucu token'ı istekler arası
 * sızardı; bu yüzden kayıt yalnız tarayıcıda yapılır.
 */
export function getTokenProvider(): TokenProvider | null {
  return typeof window === 'undefined' ? null : tokenProvider;
}
