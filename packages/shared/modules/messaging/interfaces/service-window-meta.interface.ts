/**
 * `MESSAGING.SERVICE_WINDOW_CLOSED` hatasının payload'ı.
 *
 * Sözleşme `@shared`'te çünkü asıl tüketicisi frontend: mesaj kutusunu kilitleyip
 * kullanıcıyı şablon gönderimine yönlendirirken hangi kanalda olduğunu ve
 * pencerenin ne zaman kapandığını bilmesi gerekir.
 */
export interface ServiceWindowClosedMeta {
  conversationId: string;
  /** Pencereyi açan son gelen mesajın zamanı; yoksa hiç mesaj gelmemiştir. */
  lastInboundAt: string | null;
  [key: string]: unknown;
}
