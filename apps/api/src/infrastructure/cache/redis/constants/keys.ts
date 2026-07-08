export const REDIS_KEYS = {
  CLINIC: {
    DEACTIVATED: (clinicId: string) => `clinic:deactivated:${clinicId}`,
    SETTINGS: (clinicId: string) => `clinic:settings:${clinicId}`,
  },
  USER: {
    BANNED: (userId: string) => `user:banned:${userId}`,
  },
  ORGANIZATION: {
    DEACTIVATED: (organizationId: string) =>
      `organization:deactivated:${organizationId}`,
  },
  META_ADS: {
    OAUTH_STATE: (state: string) => `meta-ads:oauth-state:${state}`,
  },
  AUTH: {
    ACTOR_CACHE: (userId: string) => `auth:actor-cache:${userId}`,
    TOKEN_BLOCKLIST: (tokenHash: string) => `auth:token-blocklist:${tokenHash}`,
  },
  SUBSCRIPTION: {
    // Kiracı (org/klinik) entitlement cache'i — abonelik event'lerinde bust edilir.
    ENTITLEMENTS: (organizationId: string, clinicId?: string | null) =>
      `subscription:entitlements:${organizationId}:${clinicId ?? 'ORG'}`,
    // Bir org'a ait tüm entitlement anahtarlarını (org + klinikleri) toplu bust için desen.
    ENTITLEMENTS_ORG_PATTERN: (organizationId: string) =>
      `subscription:entitlements:${organizationId}:*`,
  },
  TRANSFER: {
    AVAILABILITY: (paramsHash: string) =>
      `transfer:availability:${paramsHash}`,
    // AI asistanı için kısa optionId → HotelBeds transfer rateKey + bağlam.
    RATE_OPTION: (token: string) => `transfer:rate-option:${token}`,
  },
  HOTEL: {
    // AI asistanı için kısa optionId → HotelBeds rateKey + rezervasyon bağlamı.
    RATE_OPTION: (token: string) => `hotel:rate-option:${token}`,
  },
} as const;
