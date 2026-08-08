import { QueryResponse } from '@shared/common/response/response.interface';
import { MessageResponse } from '@shared/modules/messaging/interfaces';

export type GetConversationMessagesResponse = QueryResponse<MessageResponse[]>;
