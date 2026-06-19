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
  createdAt: Date;
  updatedAt: Date;
}

/** Kanal kayıtlı değilse data null döner. */
export type GetClinicWhatsappChannelResponse =
  QueryResponse<ClinicWhatsappChannelView | null>;
