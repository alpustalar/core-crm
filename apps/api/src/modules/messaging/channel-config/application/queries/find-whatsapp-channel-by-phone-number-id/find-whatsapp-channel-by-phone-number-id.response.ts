import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Webhook routing görünümü: gelen Meta olayındaki phone_number_id'den hangi kliniğe
 * ait olduğunu çözer. Inbound mesaj komutu clinicId/organizationId'yi buradan alır.
 */
export interface WhatsappChannelRoute {
  id: string;
  clinicId: string;
  organizationId: string;
  phoneNumberId: string;
  isActive: boolean;
}

/** Numara hiçbir kanala bağlı değilse data null döner (olay yok sayılır). */
export type FindWhatsappChannelByPhoneNumberIdResponse =
  QueryResponse<WhatsappChannelRoute | null>;
