import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Telegram webhook'unun (clinicId yol parametresi) doğrulama + routing için ihtiyaç
 * duyduğu kanal bilgisi. SADECE internal (webhook controller) kullanır; bot token içermez.
 */
export interface TelegramInboundRouting {
  organizationId: string;
  /** setWebhook ile kurulan secret_token; gelen istek başlığı bununla karşılaştırılır. */
  webhookSecret: string | null;
  isActive: boolean;
}

/** Kanal yoksa data null döner. */
export type GetTelegramInboundRoutingResponse =
  QueryResponse<TelegramInboundRouting | null>;
