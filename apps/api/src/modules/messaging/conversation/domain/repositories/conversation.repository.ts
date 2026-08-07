import { Conversation as IConversation } from '@shared';
import { Conversation } from '../entities/conversation.entity';
import {
  FindConversationByContactProps,
  FindConversationsFilter,
} from '@modules/messaging/conversation/domain/contracts/conversation.contracts';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CONVERSATION_COMMAND_REPOSITORY = Symbol(
  'IConversationCommandRepository'
);
export const CONVERSATION_QUERY_REPOSITORY = Symbol(
  'IConversationQueryRepository'
);

export interface IConversationCommandRepository
  extends IBaseCommandRepository<Conversation> {
  /**
   * Yazışmayı `FOR UPDATE` ile kilitleyerek yükler — yalnız aktif transaction içinde.
   * `unreadCount` gibi oku-değiştir-yaz alanları olduğu için, yazışmayı mutasyona
   * uğratacak her akış (atama, kapatma, okundu, gelen mesaj) bu metodu kullanır.
   */
  findByIdForUpdate(id: string): Promise<Conversation | null>;
  /** Kontak yazışmasını kilitleyerek yükler (gelen mesaj akışı) — yalnız transaction içinde. */
  findByContactForUpdate(
    props: FindConversationByContactProps
  ): Promise<Conversation | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IConversationQueryRepository {
  findById(id: string): Promise<IConversation | null>;
  findByContact(
    props: FindConversationByContactProps
  ): Promise<IConversation | null>;
  findMany(
    filter: FindConversationsFilter
  ): Promise<{ items: IConversation[]; total: number }>;
}
