import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Gönderim için gereken çözülmüş (decrypted) Telegram credential'ı. SADECE internal
 * (adapter/queue) akışından kullanılır — controller'a ASLA açılmaz; botToken düz metindir.
 */
export interface TelegramChannelCredentials {
  botToken: string;
}

/** Kanal yok/pasif veya botToken yapılandırılmamışsa data null döner. */
export type GetTelegramChannelCredentialsResponse =
  QueryResponse<TelegramChannelCredentials | null>;
