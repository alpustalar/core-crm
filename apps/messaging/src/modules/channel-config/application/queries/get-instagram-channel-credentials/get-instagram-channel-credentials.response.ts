import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Gönderim için gereken çözülmüş (decrypted) Instagram credential'ı. SADECE internal
 * (adapter/queue) akışından kullanılır — controller'a ASLA açılmaz; accessToken düz metindir.
 */
export interface InstagramChannelCredentials {
  /** Instagram professional account id — `/{igUserId}/messages` gönderim hedefi. */
  igUserId: string;
  accessToken: string;
  tokenExpiresAt: Date | null;
}

/** Kanal yok/pasif veya accessToken yapılandırılmamışsa data null döner. */
export type GetInstagramChannelCredentialsResponse =
  QueryResponse<InstagramChannelCredentials | null>;
