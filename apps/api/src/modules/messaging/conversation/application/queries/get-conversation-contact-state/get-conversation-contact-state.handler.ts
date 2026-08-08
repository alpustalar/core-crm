import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CONVERSATION_QUERY_REPOSITORY,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { GetConversationContactStateQuery } from './get-conversation-contact-state.query';
import { GetConversationContactStateResponse } from './get-conversation-contact-state.response';

@QueryHandler(GetConversationContactStateQuery)
export class GetConversationContactStateHandler implements IQueryHandler<
  GetConversationContactStateQuery,
  GetConversationContactStateResponse
> {
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository
  ) {}

  async execute(
    query: GetConversationContactStateQuery
  ): Promise<GetConversationContactStateResponse> {
    const conversation = await this.conversationQueryRepo.findByContact({
      clinicId: query.payload.clinicId,
      channel: query.payload.channel,
      contactPhone: query.payload.contactPhone,
    });
    if (!conversation) return { data: null };

    return {
      data: {
        conversationId: conversation.id,
        patientId: conversation.patientId,
      },
    };
  }
}
