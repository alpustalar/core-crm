import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';

import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/conversation/domain/repositories/conversation.repository';
import {
  IMessageCommandRepository,
  MESSAGE_COMMAND_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import { Message } from '@modules/conversation/domain/entities/message.entity';
import { SendMessageProducer } from '@modules/conversation/infrastructure/queue/producers/send-message.producer';
import {
  AI_MEMORY_CACHE_SERVICE,
  IAiMemoryCacheService,
} from '@modules/ai-agent/domain/interfaces/ai-memory-cache.service.interface';
import { SendMessageCommand } from './send-message.command';
import { MessageTypeSchema } from '@shared';
import { MessageChannel } from '@shared';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<
  SendMessageCommand,
  string
> {
  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationRepo: IConversationCommandRepository,
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageRepo: IMessageCommandRepository,
    @Inject(AI_MEMORY_CACHE_SERVICE)
    private readonly aiMemoryCache: IAiMemoryCacheService,
    private readonly sendMessageProducer: SendMessageProducer
  ) {}

  async execute(command: SendMessageCommand): Promise<string> {
    const { clinicId, input, ctx } = command.payload;

    // Servis penceresi kontrolü mesajın yazılıp yazılmayacağına karar veriyor →
    // okuma command repo'dan (ana bağlantı). Pencere bitişini başka bir akış
    // (teslim webhook'u) yazdığı için replica'dan okumak kapalı pencereyi açık
    // gösterebilirdi. Yazışma mutasyona uğramadığından kilit gerekmez.
    const conversation = await this.conversationRepo.findById(
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
    const saved = await this.messageRepo.create(message);

    // Giden metin AI bağlam penceresine de yazılır — personelin araya girdiği mesajı
    // AI bir sonraki turda görsün (aksi halde cache DB'den sapardı).
    const body = input.body?.trim();
    if (body) {
      await this.aiMemoryCache.append({
        conversationId: conversation.id,
        message: { role: 'assistant', content: body },
      });
    }

    await this.sendMessageProducer.enqueueSend(saved.id);

    return saved.id;
  }
}
