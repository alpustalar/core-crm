import { Pagination } from '@shared';
import { Message } from '../entities/message.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const MESSAGE_COMMAND_REPOSITORY = Symbol('IMessageCommandRepository');
export const MESSAGE_QUERY_REPOSITORY = Symbol('IMessageQueryRepository');

export interface IMessageCommandRepository
  extends IBaseCommandRepository<Message> {
  /**
   * Dış id (wamid) ile yükler — kilitsiz. Mükerrer webhook tespiti gibi, kararı
   * `@@unique(externalId)` kısıtının nihai olarak koruduğu okumalar içindir.
   */
  findByExternalId(externalId: string): Promise<Message | null>;
  /**
   * Dış id ile `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde.
   * Teslim durumu (sent/delivered/read) webhook'ları sırasız ve eşzamanlı geldiği
   * için durum geçişini besleyen okuma kilitli olmalıdır.
   */
  findByExternalIdForUpdate(externalId: string): Promise<Message | null>;
  /** Mesajı `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde. */
  findByIdForUpdate(id: string): Promise<Message | null>;
}

export interface IMessageQueryRepository {
  findById(id: string): Promise<Message | null>;
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
