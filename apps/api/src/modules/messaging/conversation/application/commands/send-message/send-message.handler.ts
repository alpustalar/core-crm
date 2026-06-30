import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';

import {
  CONVERSATION_QUERY_REPOSITORY,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  IMessageCommandRepository,
  MESSAGE_COMMAND_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { SendMessageProducer } from '@modules/messaging/conversation/infrastructure/queue/producers/send-message.producer';
import { SendMessageCommand } from './send-message.command';
import { MessageTypeSchema } from '@shared/generated-zod';
import { MessageChannel } from '@prisma/client';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler
  implements ICommandHandler<SendMessageCommand, string>
{
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageCommandRepo: IMessageCommandRepository,
    private readonly sendMessageProducer: SendMessageProducer
  ) {}

  async execute(command: SendMessageCommand): Promise<string> {
    const { clinicId, input, ctx } = command;

    const conversation = await this.conversationQueryRepo.findById(
      input.conversationId
    );
    if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
    if (conversation.clinicId !== clinicId) {
      throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
    }

    // WhatsApp 24s servis penceresi: pencere kapalıyken serbest (TEXT/MEDIA) mesaj
    // gönderilemez, yalnızca onaylı şablon (TEMPLATE/HSM) gönderilebilir. Bu kısıt
    // WhatsApp'a özgüdür; Telegram'da serbest metin her zaman gönderilebilir.
    const type = input.type ?? MessageTypeSchema.enum.TEXT;
    if (
      conversation.channel === MessageChannel.WHATSAPP &&
      type !== MessageTypeSchema.enum.TEMPLATE &&
      !conversation.isWithinServiceWindow()
    ) {
      throw new BadRequestException(
        '24 saatlik servis penceresi kapalı; yalnızca onaylı şablon mesaj gönderilebilir.'
      );
    }

    // OUTBOUND mesaj QUEUED olarak persist edilir; gönderim kuyruğa düşer
    // (kanal HTTP latency'si isteği bloklamaz, retry/rate-limit kuyrukta).
    const message = Message.createOutbound({
      conversationId: conversation.id,
      type,
      body: input.body,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      sentByUserId: ctx.actor.userId,
    });
    const saved = await this.messageCommandRepo.save(message);

    await this.sendMessageProducer.enqueueSend(saved.id);

    return saved.id;
  }
}
