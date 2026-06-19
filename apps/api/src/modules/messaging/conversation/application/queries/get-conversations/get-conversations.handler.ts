import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConversationResponse } from '@shared/modules/messaging/interfaces';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  CONVERSATION_QUERY_REPOSITORY,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { GetConversationsQuery } from './get-conversations.query';
import { GetConversationsResponse } from './get-conversations.response';

@QueryHandler(GetConversationsQuery)
export class GetConversationsHandler
  implements IQueryHandler<GetConversationsQuery, GetConversationsResponse>
{
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository
  ) {}

  async execute(
    query: GetConversationsQuery
  ): Promise<GetConversationsResponse> {
    const { clinicId, dto, pagination } = query;

    const result = await this.conversationQueryRepo.findMany({
      clinicId,
      status: dto.status,
      assignedUserId: dto.assignedUserId,
      pagination,
    });

    return {
      data: result.items.map((c) => this.toView(c)),
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }

  private toView(c: Conversation): ConversationResponse {
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
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
