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
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  IMessageCommandRepository,
  MESSAGE_COMMAND_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { SendMessageProducer } from '@modules/messaging/conversation/infrastructure/queue/producers/send-message.producer';
import { SendTemplateMessageCommand } from './send-template-message.command';
import { MessageTypeSchema } from '@shared/generated-zod';

@CommandHandler(SendTemplateMessageCommand)
export class SendTemplateMessageHandler
  implements ICommandHandler<SendTemplateMessageCommand, string>
{
  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageCommandRepo: IMessageCommandRepository,
    private readonly sendMessageProducer: SendMessageProducer
  ) {}

  async execute(command: SendTemplateMessageCommand): Promise<string> {
    const { clinicId, input, ctx } = command.payload;

    // Opt-out kontrolü gönderimi engelleyen bir iş kararı → okuma command repo'dan.
    // Opt-out'u gelen mesaj akışı yazdığı için replica gecikmesi, çıkmış kontağa
    // pazarlama şablonu göndermeye (uyum ihlali) yol açabilirdi.
    const conversation = await this.conversationCommandRepo.findById(
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

    // şablon mesajı 24 saat penceresine tabii değil

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
    const saved = await this.messageCommandRepo.create(message);

    await this.sendMessageProducer.enqueueSend(saved.id);

    return saved.id;
  }
}
