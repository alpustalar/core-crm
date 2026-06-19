import { Conversation } from '../entities/conversation.entity';
import {
  FindConversationByContactProps,
  FindConversationsFilter,
} from '../types/find-conversations.filter';

export const CONVERSATION_COMMAND_REPOSITORY = Symbol(
  'IConversationCommandRepository'
);
export const CONVERSATION_QUERY_REPOSITORY = Symbol(
  'IConversationQueryRepository'
);

export interface IConversationCommandRepository {
  save(entity: Conversation): Promise<Conversation>;
}

export interface IConversationQueryRepository {
  findById(id: string): Promise<Conversation | null>;
  findByContact(
    props: FindConversationByContactProps
  ): Promise<Conversation | null>;
  findMany(
    filter: FindConversationsFilter
  ): Promise<{ items: Conversation[]; total: number }>;
}
