/** Google Gemini (Generative Language) REST API sabitleri. */
export const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta';

/** request.model bir Gemini modeli değilse (ör. klinik provider'ı GEMINI yapıp model'i
 *  değiştirmediyse) kullanılacak güvenli varsayılan. */
export const GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash';

/** Tek generateContent çağrısı için zaman aşımı. */
export const GEMINI_TIMEOUT_MS = 30_000;
