export const WHATSAPP_CLOUD_API = Symbol('IWhatsappCloudApi');

export interface WhatsappTokenResult {
  accessToken: string;
  expiresAt: Date | null;
}

/** Gelen medyanın anlık (proxy) içeriği — saklanmaz, Meta'dan taze çekilir. */
export interface WhatsappMediaContent {
  content: Buffer;
  mimeType: string;
}

/** WABA'da tanımlı onaylı/bekleyen mesaj şablonu özeti. */
export interface WhatsappTemplateSummary {
  name: string;
  language: string;
  status: string; // APPROVED | PENDING | REJECTED | PAUSED | DISABLED
  category: string; // MARKETING | UTILITY | AUTHENTICATION
  components: unknown[];
}

/** Numara sağlık/kalite bilgisi (Graph API'den anlık). */
export interface WhatsappPhoneNumberHealth {
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  qualityRating: string | null; // GREEN | YELLOW | RED
  messagingTier: string | null; // ör. TIER_1K
  nameStatus: string | null;
  codeVerificationStatus: string | null;
}

/** WhatsApp Business işletme profili. */
export interface WhatsappBusinessProfile {
  about: string | null;
  address: string | null;
  description: string | null;
  email: string | null;
  vertical: string | null;
  websites: string[];
  profilePictureUrl: string | null;
}

/** İşletme profili güncelleme girişi (yalnızca verilen alanlar gönderilir). */
export interface UpdateWhatsappBusinessProfileInput {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  vertical?: string;
  websites?: string[];
}

/**
 * WhatsApp Cloud API onboarding (Embedded Signup) çağrıları. Klinik kendi WhatsApp
 * Business hesabını platforma bağlarken: yetki kodunu token'a çevirme + WABA'yı
 * platform app'inin webhook'una abone etme.
 */
export interface IWhatsappCloudApi {
  /** Embedded Signup yetki kodunu erişim token'ına çevirir. */
  exchangeCodeForToken(code: string): Promise<WhatsappTokenResult>;
  /**
   * Kısa ömürlü token'ı uzun-ömürlüye (~60 gün) çevirir (grant_type=fb_exchange_token).
   * Embedded Signup token'ı süreli olabildiği için bağlanırken bir kez çağrılır.
   */
  exchangeForLongLivedToken(
    shortLivedToken: string
  ): Promise<WhatsappTokenResult>;
  /** WABA'yı platform app'inin webhook aboneliğine ekler. */
  subscribeAppToWaba(wabaId: string, accessToken: string): Promise<void>;
  /** WABA'da tanımlı mesaj şablonlarını listeler (FE şablon seçici için). */
  listMessageTemplates(
    wabaId: string,
    accessToken: string
  ): Promise<WhatsappTemplateSummary[]>;
  /** Numara sağlık/kalite bilgisini çeker (quality_rating, messaging_limit_tier...). */
  getPhoneNumberHealth(
    phoneNumberId: string,
    accessToken: string
  ): Promise<WhatsappPhoneNumberHealth>;
  /** İşletme profilini okur. */
  getBusinessProfile(
    phoneNumberId: string,
    accessToken: string
  ): Promise<WhatsappBusinessProfile>;
  /** İşletme profilini günceller (yalnızca verilen alanlar). */
  updateBusinessProfile(
    phoneNumberId: string,
    accessToken: string,
    input: UpdateWhatsappBusinessProfileInput
  ): Promise<void>;
  /**
   * Telefon numarasını Cloud API'ye register eder (2FA PIN ile). Bu adım yapılmadan
   * numaradan mesaj gönderilemez. PIN platform tarafından üretilip şifreli saklanır.
   */
  registerPhoneNumber(
    phoneNumberId: string,
    pin: string,
    accessToken: string
  ): Promise<void>;
  /**
   * Gelen medyayı Meta'dan anlık indirir: media id → geçici URL → token'lı indirme.
   * Saklamaz; önizleme/proxy için byte + mime döner. Bulunamazsa null.
   */
  fetchMedia(
    mediaId: string,
    accessToken: string
  ): Promise<WhatsappMediaContent | null>;
}

export type WhatsappCloudApiConfig = {
  appId: string;
  appSecret: string;
};

export const WHATSAPP_CLOUD_API_CONFIG = Symbol('WhatsappCloudApiConfig');
