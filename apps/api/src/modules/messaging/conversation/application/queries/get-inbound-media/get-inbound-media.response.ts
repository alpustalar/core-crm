import { QueryResponse } from '@shared/common/response/response.interface';
import { WhatsappMediaContent } from '@modules/messaging/channel-config/domain/interfaces/whatsapp-cloud-api.interface';

/** Mesaj medya değilse / erişilemiyorsa data null döner. */
export type GetInboundMediaResponse =
  QueryResponse<WhatsappMediaContent | null>;
