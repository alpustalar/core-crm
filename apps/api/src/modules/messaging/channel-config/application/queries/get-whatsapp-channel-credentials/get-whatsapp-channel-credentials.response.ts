import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Gönderim için gereken çözülmüş (decrypted) kanal credential'ı. SADECE internal
 * (adapter/queue) akışından kullanılır — controller'a ASLA açılmaz; accessToken düz
 * metindir.
 */
export interface WhatsappChannelCredentials {
  phoneNumberId: string;
  accessToken: string;
  /** Token son geçerlilik tarihi; geçmişse adapter gönderimi reddeder (reconnect gerek). */
  tokenExpiresAt: Date | null;
  /** WABA id — şablon listesi / profil / kalite sorguları için. */
  wabaId: string | null;
}

/** Kanal yok veya accessToken yapılandırılmamışsa data null döner. */
export type GetWhatsappChannelCredentialsResponse =
  QueryResponse<WhatsappChannelCredentials | null>;
