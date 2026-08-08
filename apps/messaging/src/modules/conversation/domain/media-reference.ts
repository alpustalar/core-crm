/**
 * Gelen medya, kendi storage'ımıza indirilmez; Message.mediaUrl içinde Meta media id'sine
 * bir referans olarak saklanır (`whatsapp-media:{id}`). Önizleme anında bu referanstan
 * media id çözülüp Meta'dan proxy ile çekilir.
 */
export const WHATSAPP_MEDIA_REF_PREFIX = 'whatsapp-media:';

export function toWhatsappMediaRef(mediaId: string): string {
  return `${WHATSAPP_MEDIA_REF_PREFIX}${mediaId}`;
}

/** Referanstan media id çözer; referans değilse (ör. gerçek link) null döner. */
export function parseWhatsappMediaRef(ref: string | null): string | null {
  if (!ref || !ref.startsWith(WHATSAPP_MEDIA_REF_PREFIX)) return null;
  return ref.slice(WHATSAPP_MEDIA_REF_PREFIX.length);
}
