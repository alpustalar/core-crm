// Messaging servisinin kendi iş adları ve akış politikaları (retry, rate limit,
// bağlam penceresi). Kuyruk ADLARI çekirdektedir (`QUEUES`) — onları api ile
// paylaşmak gerekir; buradakiler messaging'in içidir, kimse bilmek zorunda değil.

export const MESSAGING_JOBS = {
  SEND_MESSAGE: 'messaging-send-message',
} as const;

/** Outbound mesaj job'unun deneme sayısı (producer + processor son-deneme tespiti). */
export const MESSAGING_SEND_MAX_ATTEMPTS = 5;

/**
 * Giden mesaj kuyruğu rate-limit'i (worker-global). WhatsApp Cloud API varsayılan ~80
 * msg/s; limiter olmadan yoğun anda 429 + gereksiz retry olur. Bu üst sınır tüm
 * klinikler için ortaktır; klinik başına pay aşağıdaki Redis kotasıyla korunur.
 */
export const MESSAGING_SEND_RATE_MAX = 80;

export const MESSAGING_SEND_RATE_DURATION_MS = 1000;

/**
 * Klinik (WhatsApp numarası) başına gönderim kotası — Redis kayan pencere. WhatsApp
 * limitleri numara bazlıdır; worker-geneli BullMQ limiter'ı tek bir kliniğin tüm kotayı
 * tüketip diğerlerini aç bırakmasını engelleyemez. Kota dolduğunda job hata almaz,
 * ertelenir (deneme sayısı harcanmaz).
 */
export const MESSAGING_SEND_CLINIC_RATE_MAX = 20;

export const MESSAGING_SEND_CLINIC_RATE_WINDOW_SECONDS = 1;

/**
 * Kota/sıra beklemesinde job'un ertelenmesine eklenen güvenlik payı (ms). Pencerenin
 * tam sınırında uyanıp tekrar reddedilmeyi önler.
 */
export const MESSAGING_DELIVERY_RETRY_BUFFER_MS = 50;

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

/**
 * Modele beslenen bağlam penceresi (sohbet turu adedi). Redis'te bu boyutta tutulur;
 * token maliyetini sınırlar.
 */
export const AI_MEMORY_WINDOW_SIZE = 10;

/**
 * Pencere soğukken DB'den çekilen HAM mesaj adedi. Pencere boyutundan yüksektir:
 * metinsiz mesajlar (medya/konum/reaksiyon) elenip ardışık aynı-rol turlar
 * birleştirildikten sonra geriye tam pencere kalsın diye.
 */
export const AI_MEMORY_FETCH_LIMIT = 40;
