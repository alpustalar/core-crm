import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
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

@QueryHandler(GetConversationMessagesQuery)
export class GetConversationMessagesHandler implements IQueryHandler<
  GetConversationMessagesQuery,
  GetConversationMessagesResponse
> {
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository
  ) {}

  async execute(
    query: GetConversationMessagesQuery
  ): Promise<GetConversationMessagesResponse> {
    const conversation = await this.conversationQueryRepo.findById(
      query.payload.conversationId
    );
    if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
    if (conversation.clinicId !== query.payload.clinicId) {
      throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
    }

    const result = await this.messageQueryRepo.findManyByConversation(
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
