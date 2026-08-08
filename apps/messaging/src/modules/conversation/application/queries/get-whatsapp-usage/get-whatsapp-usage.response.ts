import { QueryResponse } from '@shared/common/response/response.interface';
import { WhatsappUsageView } from '@shared/modules/messaging/interfaces';

export type GetWhatsappUsageResponse = QueryResponse<WhatsappUsageView>;
