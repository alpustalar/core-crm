import type { MessageChannelValue } from './conversation-response.interface';

/**
 * `MESSAGING.CHANNEL_NOT_CONNECTED` hatasının payload'ı.
 *
 * Sözleşme `@shared`'te çünkü asıl tüketicisi frontend: kanal bağlı değilse
 * kullanıcıyı **o kanalın** bağlantı ekranına yönlendirmek gerekir. Hangi kanal
 * olduğu metinden ("WhatsApp kanalı bulunamadı.") ayıklanamaz — kanal adı
 * `meta`'da makine-okunur durur.
 */
export interface ChannelNotConnectedMeta {
  channel: MessageChannelValue;
  clinicId: string;
  [key: string]: unknown;
}
