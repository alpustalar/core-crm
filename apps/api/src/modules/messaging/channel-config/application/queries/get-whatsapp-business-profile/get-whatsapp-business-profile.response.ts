import { QueryResponse } from '@shared/common/response/response.interface';
import { WhatsappBusinessProfileView } from '@shared/modules/messaging/interfaces';

/** Kanal yapılandırılmamışsa null döner. */
export type GetWhatsappBusinessProfileResponse =
  QueryResponse<WhatsappBusinessProfileView | null>;
