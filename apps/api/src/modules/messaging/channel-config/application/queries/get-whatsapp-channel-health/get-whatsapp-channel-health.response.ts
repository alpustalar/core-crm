import { QueryResponse } from '@shared/common/response/response.interface';
import { WhatsappChannelHealthView } from '@shared/modules/messaging/interfaces';

/** Kanal yapılandırılmamışsa null döner. */
export type GetWhatsappChannelHealthResponse =
  QueryResponse<WhatsappChannelHealthView | null>;
