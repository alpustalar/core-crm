import { QueryResponse } from '@shared/common/response/response.interface';
import { ConversationResponse } from '@shared/modules/messaging/interfaces';

export type GetConversationsResponse = QueryResponse<ConversationResponse[]>;
