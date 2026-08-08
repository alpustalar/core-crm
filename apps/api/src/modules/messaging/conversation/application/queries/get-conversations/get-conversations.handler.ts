import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConversationResponse } from '@shared/modules/messaging/interfaces';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  CONVERSATION_QUERY_REPOSITORY,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Conversation as IConversation } from '@shared';
import { GetConversationsQuery } from './get-conversations.query';
import { GetConversationsResponse } from './get-conversations.response';

@QueryHandler(GetConversationsQuery)
export class GetConversationsHandler implements IQueryHandler<
  GetConversationsQuery,
  GetConversationsResponse
> {
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationRepo: IConversationQueryRepository
  ) {}

  async execute(
    query: GetConversationsQuery
  ): Promise<GetConversationsResponse> {
    const { clinicId, filter, pagination } = query.payload;

    const result = await this.conversationRepo.findMany({
      clinicId,
      status: filter.status,
      assignedUserId: filter.assignedUserId,
      pagination,
    });

    return {
      data: result.items.map((conversation) => this.toView(conversation)),
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }

  private toView(c: IConversation): ConversationResponse {
    return {
      id: c.id,
      clinicId: c.clinicId,
      channel: c.channel,
      contactPhone: c.contactPhone,
      contactName: c.contactName,
      patientId: c.patientId,
      leadId: c.leadId,
      status: c.status,
      assignedUserId: c.assignedUserId,
      lastMessageAt: c.lastMessageAt,
      unreadCount: c.unreadCount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
