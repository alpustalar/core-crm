export const INSTAGRAM_GRAPH_API = Symbol('IInstagramGraphApi');

export interface InstagramTokenResult {
  accessToken: string;
  expiresAt: Date | null;
}

/**
 * Instagram (Meta Graph / Messenger Platform) onboarding çağrıları. Facebook/Instagram
 * Login'den dönen yetki kodunu platform app credential'larıyla token'a çevirir ve IG/Page
 * hesabını app webhook'una (messages) abone eder. App-seviyesi credential env'den.
 */
export interface IInstagramGraphApi {
  /** Login yetki kodunu erişim token'ına çevirir. */
  exchangeCodeForToken(code: string): Promise<InstagramTokenResult>;
  /** Kısa-ömürlü token'ı uzun-ömürlüye (~60 gün) çevirir. */
  exchangeForLongLivedToken(
    shortLivedToken: string
  ): Promise<InstagramTokenResult>;
  /** IG/Page hesabını app webhook aboneliğine ekler (subscribed_fields=messages). */
  subscribeToWebhooks(igUserId: string, accessToken: string): Promise<void>;
}
