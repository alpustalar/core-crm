import { QueryResponse } from '@shared/common/response/response.interface';
import { WhatsappTemplateView } from '@shared/modules/messaging/interfaces';

/** Kanal yapılandırılmamışsa boş liste döner. */
export type GetWhatsappTemplatesResponse = QueryResponse<WhatsappTemplateView[]>;
