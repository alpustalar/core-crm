import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Klinik WhatsApp kanal config görünümü. accessToken/verifyToken gibi gizli
 * credential'lar FE'ye sızdırılmaz; yalnızca yapılandırılmış olup olmadığı bilgisi
 * (`hasAccessToken`) döner.
 */
export interface ClinicWhatsappChannelView {
  id: string;
  clinicId: string;
  phoneNumberId: string;
  wabaId: string | null;
  displayPhoneNumber: string | null;
  hasAccessToken: boolean;
  isActive: boolean;
  /** Aktif ama token yok/expired → FE yeniden bağlama (reconnect) göstermeli. */
  needsReauth: boolean;
  tokenExpiresAt: Date | null;
  /** Webhook'tan gelen son bilinen kalite/limit (canlı değer için health query). */
  qualityRating: string | null;
  messagingTier: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Kanal kayıtlı değilse data null döner. */
export type GetClinicWhatsappChannelResponse =
  QueryResponse<ClinicWhatsappChannelView | null>;
