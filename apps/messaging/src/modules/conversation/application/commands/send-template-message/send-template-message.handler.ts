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
import { SendTemplateMessageCommand } from './send-template-message.command';
import { MessageTypeSchema } from '@shared';

@CommandHandler(SendTemplateMessageCommand)
export class SendTemplateMessageHandler implements ICommandHandler<
  SendTemplateMessageCommand,
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

  async execute(command: SendTemplateMessageCommand): Promise<string> {
    const { clinicId, input, ctx } = command.payload;

    // Opt-out kontrolü gönderimi engelleyen bir iş kararı → okuma command repo'dan.
    // Opt-out'u gelen mesaj akışı yazdığı için replica gecikmesi, çıkmış kontağa
    // pazarlama şablonu göndermeye (uyum ihlali) yol açabilirdi.
    const conversation = await this.conversationRepo.findById(
      input.conversationId
    );
    if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
    if (conversation.clinicId !== clinicId) {
      throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
    }

    // Pazarlama uyumu: kontak opt-out yaptıysa MARKETING kategorili şablon gönderilemez.
    if (
      input.category?.toUpperCase() === 'MARKETING' &&
      conversation.marketingOptOut
    ) {
      throw new BadRequestException(
        'Kontak pazarlama mesajlarından çıkmış; MARKETING şablonu gönderilemez.'
      );
    }


    const message = Message.createOutbound({
      conversationId: conversation.id,
      type: MessageTypeSchema.enum.TEMPLATE,
      body: input.templateName, // listede gösterim için
      sentByUserId: ctx.actor.userId,
      template: {
        name: input.templateName,
        language: input.languageCode,
        components: {
          bodyParams: input.variables ?? [],
          headerText: input.headerText,
          headerMediaUrl: input.headerMediaUrl,
          headerMediaType: input.headerMediaType,
          urlButtonParams: input.buttonParams,
        },
      },
    });
    const saved = await this.messageRepo.create(message);

    // Cache, DB'den yeniden kurulacak pencerenin birebir aynısını taşımalı; aksi halde
    // AI'ın gördüğü geçmiş cache'in sıcak/soğuk olmasına göre değişirdi. DB yolu
    // `message.body`'yi (şablon adı) kullandığı için burada da o yazılır.
    await this.aiMemoryCache.append({
      conversationId: conversation.id,
      message: { role: 'assistant', content: input.templateName },
    });

    await this.sendMessageProducer.enqueueSend(saved.id);

    return saved.id;
  }
}
