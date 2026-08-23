import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ConversationNotFoundException,
} from '@modules/conversation/domain/exceptions/conversation.exceptions';
import { MessageResponse } from '@shared/modules/messaging/interfaces';
import { buildPaginationMeta } from '@common/pagination/pagination-meta';
import {
  CONVERSATION_QUERY_REPOSITORY,
  IConversationQueryRepository,
} from '@modules/conversation/domain/repositories/conversation.repository';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import { Message as IMessage } from '@shared';
import { GetConversationMessagesQuery } from './get-conversation-messages.query';
import { GetConversationMessagesResponse } from './get-conversation-messages.response';
import { assertActorCanAccessClinic } from '@modules/conversation/domain/guards/clinic-access.guard-fn';

@QueryHandler(GetConversationMessagesQuery)
export class GetConversationMessagesHandler implements IQueryHandler<
  GetConversationMessagesQuery,
  GetConversationMessagesResponse
> {
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationRepo: IConversationQueryRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageRepo: IMessageQueryRepository
  ) {}

  async execute(
    query: GetConversationMessagesQuery
  ): Promise<GetConversationMessagesResponse> {
    assertActorCanAccessClinic(query.payload.ctx.actor, query.payload.clinicId);

    const conversation = await this.conversationRepo.findById(
      query.payload.conversationId
    );
    // Başka kliniğe ait yazışma da "bulunamadı" sayılır: aktörün bu kliniğe
    // erişimi yukarıda doğrulandı, kaydın varlığını sızdırmanın anlamı yok.
    if (!conversation || conversation.clinicId !== query.payload.clinicId) {
      throw new ConversationNotFoundException();
    }

    const result = await this.messageRepo.findManyByConversation(
      query.payload.conversationId,
      query.payload.pagination
    );

    return {
      data: result.items.map((m) => this.toView(m)),
      meta: {
        pagination: buildPaginationMeta(query.payload.pagination, result.total),
      },
    };
  }

  private toView(m: IMessage): MessageResponse {
    return {
      id: m.id,
      conversationId: m.conversationId,
      direction: m.direction,
      type: m.type,
      body: m.body,
      mediaUrl: m.mediaUrl,
      status: m.status,
      externalId: m.externalId,
      errorReason: m.errorReason,
      sentByUserId: m.sentByUserId,
      payload: m.payload,
      replyToExternalId: m.replyToExternalId,
      createdAt: m.createdAt,
    };
  }
}
