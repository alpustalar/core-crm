import { Pagination } from '@shared';
import { Message } from '../entities/message.entity';

export const MESSAGE_COMMAND_REPOSITORY = Symbol('IMessageCommandRepository');
export const MESSAGE_QUERY_REPOSITORY = Symbol('IMessageQueryRepository');

export interface IMessageCommandRepository {
  create(entity: Message): Promise<Message>;
  update(entity: Message): Promise<Message>;
}

export interface IMessageQueryRepository {
  findById(id: string): Promise<Message | null>;
  findByExternalId(externalId: string): Promise<Message | null>;
  findManyByConversation(
    conversationId: string,
    pagination: Pagination
  ): Promise<{ items: Message[]; total: number }>;
  /** Yazışmadaki en güncel gelen (inbound) mesajın WhatsApp id'si (okundu işareti için). */
  findLatestInboundExternalId(conversationId: string): Promise<string | null>;
  /** Bir dönemde faturalanabilir mesajları konuşma kategorisine göre sayar (maliyet). */
  aggregateUsageByCategory(params: {
    clinicId: string;
    from: Date;
    to: Date;
  }): Promise<Array<{ category: string | null; count: number }>>;
}
