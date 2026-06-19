import { Pagination } from '@shared';
import { Message } from '../entities/message.entity';

export const MESSAGE_COMMAND_REPOSITORY = Symbol('IMessageCommandRepository');
export const MESSAGE_QUERY_REPOSITORY = Symbol('IMessageQueryRepository');

export interface IMessageCommandRepository {
  save(entity: Message): Promise<Message>;
}

export interface IMessageQueryRepository {
  findByExternalId(externalId: string): Promise<Message | null>;
  findManyByConversation(
    conversationId: string,
    pagination: Pagination
  ): Promise<{ items: Message[]; total: number }>;
}
