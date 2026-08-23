import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ConversationNotFoundException,
  MessageNotFoundException,
} from '@modules/conversation/domain/exceptions/conversation.exceptions';
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
import { assertActorCanAccessClinic } from '@modules/conversation/domain/guards/clinic-access.guard-fn';

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

    assertActorCanAccessClinic(payload.ctx.actor, payload.clinicId);

    const message = await this.messageRepo.findById(payload.messageId);
    if (!message || message.conversationId !== payload.conversationId) {
      throw new MessageNotFoundException();
    }

    const conversation = await this.conversationRepo.findById(
      payload.conversationId
    );
    // Başka kliniğe ait yazışma da "bulunamadı" sayılır: aktörün bu kliniğe
    // erişimi yukarıda doğrulandı, kaydın varlığını sızdırmanın anlamı yok.
    if (!conversation || conversation.clinicId !== payload.clinicId) {
      throw new ConversationNotFoundException();
    }

    const mediaId = parseWhatsappMediaRef(message.mediaUrl);
    if (!mediaId) return { data: null };

    // Medya Meta'dan anlık çekilir (saklanmaz); credential klinik kanalından çözülür.
    return this.queryBus.execute(
      new FetchWhatsappMediaQuery(payload.clinicId, mediaId)
    );
  }
}
