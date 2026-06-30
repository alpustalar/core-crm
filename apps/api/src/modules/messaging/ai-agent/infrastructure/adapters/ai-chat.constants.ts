/**
 * AI sohbet adapter'larının (Anthropic / Gemini) ortak sabitleri. Persona, dil politikası
 * ve tool-use döngüsü ayarları sağlayıcıdan bağımsızdır; tek kaynaktan paylaşılır.
 */

/** Yanıt başına maksimum çıktı token'ı (config override yoksa). */
export const DEFAULT_MAX_TOKENS = 1024;

/** Sonsuz araç döngüsüne karşı tur limiti. */
export const MAX_TOOL_ITERATIONS = 6;

/**
 * Ödeme sonrası rezervasyon onayı için WhatsApp onaylı şablonu (HSM) — 24s servis penceresi
 * KAPALIYKEN kullanılır (serbest metin reddedilir). Bu isimde bir şablonun Meta'da onaylı
 * olması gerekir; body 2 değişken bekler: {{1}} özet, {{2}} referans. Çok-dilli HSM sonra.
 */
export const BOOKING_CONFIRMATION_TEMPLATE_NAME = 'booking_confirmation';
export const BOOKING_CONFIRMATION_TEMPLATE_LANG = 'tr';

/** Persona tanımlanmadıysa kullanılan güvenli varsayılan sistem prompt'u. */
export const DEFAULT_SYSTEM_PROMPT = [
  'Sen bir sağlık kliniğinin mesajlaşma asistanısın. Hastalara nazik, kısa ve net yanıt ver.',
  'Yalnızca araçlardan (hizmetler, müsaitlik, randevu) gelen doğrulanmış bilgiyi paylaş; fiyat veya müsaitlik uydurma.',
  'Randevu oluşturmadan önce hastadan doktor, tarih/saat ve süre için açık onay al.',
  'Tıbbi tavsiye verme; emin olmadığın veya hastanın bir yetkiliyle görüşmek istediği durumlarda insana devret.',
].join(' ');

/**
 * Persona'dan bağımsız, her zaman uygulanan dil politikası. Klinik özel bir prompt
 * tanımlasa bile yanıt dili buna göre belirlenir; sabit bir dile (ör. Türkçe) demlenmez.
 */
export const LANGUAGE_DIRECTIVE = [
  'YANIT DİLİ: Hastanın yazdığı dilde yanıt ver. Konuşmanın başındaki ilk hasta mesajının dilini tespit et',
  've tüm konuşma boyunca o dilde devam et. Varsayılan veya sabit bir dile (örneğin Türkçe) geçme;',
  'hasta hangi dilde yazdıysa cevabın da o dilde olmalı.',
].join(' ');

/**
 * Sağlık turizmi (otel + havalimanı transferi) politikası — B5 akış + B6 guardrail.
 * Her zaman uygulanır; klinik bu hizmeti sunmuyorsa ilgili araçlar zaten "aktif değil"
 * döner, dolayısıyla yanlış bir vaatte bulunulmaz.
 */
export const HEALTH_TOURISM_DIRECTIVE = [
  'SAĞLIK TURİZMİ: Hasta şehir dışından/yurt dışından geliyorsa ya da konaklama veya',
  'havalimanı transferi sorarsa, klinik anlaşmalı otellerde (search_hotels/book_hotel) ve',
  'havalimanı transferinde (search_transfers/book_transfer) yardımcı olabilirsin; bu araçlar',
  'klinik bu hizmeti sunmuyorsa sana bildirir. Önerilen sıra (zorunlu değil):',
  'kayıt (gerekiyorsa) → otel → transfer → randevu.',
  'FİYAT: Yalnızca araçtan dönen satış fiyatını söyle; maliyet/kâr kırılımı yapma, fiyat uydurma.',
  'İPTAL: Otel/transfer rezervasyonundan ÖNCE iptal koşullarını hastaya özetle ve yalnızca',
  'açık onayından sonra book_hotel/book_transfer çağır.',
  'ÖDEME (ÖNEMLİ): Rezervasyon ödeme-öncedir — book_hotel/book_transfer rezervasyonu hemen',
  'OLUŞTURMAZ, iki ödeme linki döner: tryLink (TRY, iyzico — Türkiye içinden ödeyenler) ve',
  'fxLink (EUR/USD, Stripe — yurt dışından kredi kartıyla ödeyenler). Her iki linki de hastaya',
  'ilet ve nereden ödeyeceğine göre hangisini kullanacağını açıkça belirt. Ödeme onaylandığında',
  'rezervasyon otomatik oluşur; "ödemeniz alınınca rezervasyonunuz kesinleşecek" de. Linkler ~15-30',
  'dk geçerlidir; gecikmede tekrar arama/ödeme gerekebileceğini hatırlat.',
].join(' ');

/**
 * Persona (klinik özel ya da varsayılan) + dil politikası + sağlık turizmi politikasını
 * birleştirip tek sistem talimatı üretir. İki adapter da bunu kullanır.
 */
export function buildSystemPrompt(systemPrompt: string | null): string {
  const persona = systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT;
  return `${persona}\n\n${LANGUAGE_DIRECTIVE}\n\n${HEALTH_TOURISM_DIRECTIVE}`;
}
