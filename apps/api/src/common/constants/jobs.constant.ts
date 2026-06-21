export const FINANCE_JOBS = {
  PROCESS_LEDGER: 'process-ledger-entry',
  GENERATE_INVOICE: 'generate-invoice',
} as const;

export const E_DOCUMENT_JOBS = {
  SEND: 'send-e-document',
} as const;

export const ORGANIZATION_JOBS = {
  CLEAN_UP: 'organization-clean-up',
} as const;

export const USER_JOBS = {
  FIREBASE_ROLLBACK: 'firebase-rollback',
} as const;

export const OUTBOX_JOBS = {
  PROCESS: 'process-outbox',
} as const;

export const POS_JOBS = {
  RECONCILE_PENDING: 'pos-reconcile-pending',
} as const;

export const META_ADS_JOBS = {
  SYNC_CAMPAIGN_METRICS: 'meta-ads-sync-campaign-metrics',
  REFRESH_TOKENS: 'meta-ads-refresh-tokens',
} as const;

export const HEALTH_TOURISM_JOBS = {
  SYNC_HOTEL_CONTENT: 'health-tourism-sync-hotel-content',
} as const;

export const MESSAGING_JOBS = {
  SEND_MESSAGE: 'messaging-send-message',
} as const;

/** Outbound mesaj job'unun deneme sayısı (producer + processor son-deneme tespiti). */
export const MESSAGING_SEND_MAX_ATTEMPTS = 5;

/**
 * Giden mesaj kuyruğu rate-limit'i (worker-global). WhatsApp Cloud API varsayılan ~80
 * msg/s; limiter olmadan yoğun anda 429 + gereksiz retry olur. Per-numara limit ileri
 * iş (BullMQ groups) — şimdilik worker geneli güvenli üst sınır.
 */
export const MESSAGING_SEND_RATE_MAX = 80;
export const MESSAGING_SEND_RATE_DURATION_MS = 1000;

export const MESSAGING_AI_JOBS = {
  GENERATE_REPLY: 'messaging-ai-generate-reply',
} as const;

/** AI yanıt job'unun deneme sayısı (Anthropic geçici hataları için retry). */
export const MESSAGING_AI_MAX_ATTEMPTS = 3;

/**
 * AI yanıt kuyruğu rate-limit'i (worker-global). Anthropic tier RPM'ini aşmamak ve
 * yoğun anda 429 + gereksiz retry'ı önlemek için güvenli üst sınır.
 */
export const MESSAGING_AI_RATE_MAX = 10;
export const MESSAGING_AI_RATE_DURATION_MS = 1000;
