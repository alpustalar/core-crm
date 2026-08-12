import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FetchWhatsappMediaQuery } from '@modules/channel-config/application/queries/fetch-whatsapp-media/fetch-whatsapp-media.query';
import {
  CONVERSATION_QUERY_REPOSITORY,
  IConversationQueryRepository,
} from '@modules/conversation/domain/repositories/conversation.repository';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import { parseWhatsappMediaRef } from '@modules/conversation/domain/media-reference';
import { GetInboundMediaQuery } from './get-inbound-media.query';
import { GetInboundMediaResponse } from './get-inbound-media.response';

@QueryHandler(GetInboundMediaQuery)
export class GetInboundMediaHandler implements IQueryHandler<
  GetInboundMediaQuery,
  GetInboundMediaResponse
> {
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationRepo: IConversationQueryRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageRepo: IMessageQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(query: GetInboundMediaQuery): Promise<GetInboundMediaResponse> {
    const { payload } = query;
    const message = await this.messageRepo.findById(payload.messageId);
    if (!message || message.conversationId !== payload.conversationId) {
      throw new NotFoundException('Mesaj bulunamadı.');
    }

    const conversation = await this.conversationRepo.findById(
      payload.conversationId
    );
    if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
    if (conversation.clinicId !== payload.clinicId) {
      throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
    }

    const mediaId = parseWhatsappMediaRef(message.mediaUrl);
    if (!mediaId) return { data: null };

    // Medya Meta'dan anlık çekilir (saklanmaz); credential klinik kanalından çözülür.
    return this.queryBus.execute(
      new FetchWhatsappMediaQuery(payload.clinicId, mediaId)
    );
  }
}
