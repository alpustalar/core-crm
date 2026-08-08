/**
 * Kanal-bağımsız referral (attribution) — bir kişi "Mesaj Gönder" (Click-to-Chat) reklamına
 * tıklayıp sohbete düştüğünde Meta'nın ilk gelen mesaja iliştirdiği reklam bağlamı. WhatsApp
 * (`referral.source_type/source_id/ctwa_clid`) ve Instagram/Messenger (`referral.ad_id/ref`)
 * webhook'ları buraya normalize edilir; handler bundan attribution'lı Lead üretir.
 */
export interface InboundReferral {
  /** Reklamdan mı geldi (AD) yoksa organik post/paylaşım mı (ORGANIC). */
  medium: 'AD' | 'ORGANIC';
  /** Reklam id'si — WhatsApp `source_id` / Instagram `ad_id`. */
  adId: string | null;
  /** Referral kaynak URL'i (WhatsApp `source_url`). */
  sourceUrl: string | null;
  /** Click-to-WhatsApp click id — yalnızca WhatsApp (ileride Conversions API için). */
  ctwaClid: string | null;
  /** Reklam başlığı (varsa). */
  headline: string | null;
  /** Reklam gövde metni (varsa). */
  body: string | null;
}
