import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { MessageResponse } from '@shared/modules/messaging/interfaces';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  CONVERSATION_QUERY_REPOSITORY,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  MESSAGE_QUERY_REPOSITORY,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { GetConversationMessagesQuery } from './get-conversation-messages.query';
import { GetConversationMessagesResponse } from './get-conversation-messages.response';

@QueryHandler(GetConversationMessagesQuery)
export class GetConversationMessagesHandler
  implements
    IQueryHandler<
      GetConversationMessagesQuery,
      GetConversationMessagesResponse
    >
{
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
      query.conversationId
    );
    if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
    if (conversation.clinicId !== query.clinicId) {
      throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
    }

    const result = await this.messageQueryRepo.findManyByConversation(
      query.conversationId,
      query.pagination
    );

    return {
      data: result.items.map((m) => this.toView(m)),
      meta: { pagination: buildPaginationMeta(query.pagination, result.total) },
    };
  }

  private toView(m: Message): MessageResponse {
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
      createdAt: m.createdAt,
    };
  }
}
