import { QueryResponse } from '@shared/common/response/response.interface';
import { WhatsappMediaContent } from '@modules/channel-config/domain/interfaces/whatsapp-cloud-api.interface';

/** Medya bulunamaz/erişilemezse data null döner (Meta retention ~30 gün). */
export type FetchWhatsappMediaResponse =
  QueryResponse<WhatsappMediaContent | null>;
