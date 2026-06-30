/**
 * Klinik Telegram kanal config'inin maskeli (public) görünümü. Gerçek bot token'ı
 * ASLA sızdırılmaz; yalnızca yapılandırılmış olup olmadığı (hasBotToken) bilinir.
 */
export interface TelegramChannelResponse {
  id: string;
  clinicId: string;
  /** 'BOT_API' | 'MTPROTO' — şu an yalnız BOT_API destekleniyor. */
  provider: string;
  /** 'PENDING' | 'ACTIVE' | 'ERROR' | 'REVOKED'. */
  status: string;
  /** Bot kullanıcı adı (ör. "klinikadi_bot"); MTProto'da null. */
  botUsername: string | null;
  hasBotToken: boolean;
  isActive: boolean;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}
