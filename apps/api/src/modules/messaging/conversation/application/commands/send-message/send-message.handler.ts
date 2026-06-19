import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  MESSAGE_COMMAND_REPOSITORY,
  IMessageCommandRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import {
  MESSAGE_CHANNEL_PORT,
  MessageChannelPort,
} from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { SendMessageCommand } from './send-message.command';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler
  implements ICommandHandler<SendMessageCommand, string>
{
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageCommandRepo: IMessageCommandRepository,
    @Inject(MESSAGE_CHANNEL_PORT)
    private readonly channel: MessageChannelPort,
    private readonly txManager: TransactionManager
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

    return this.txManager.outboxRun(async () => {
      const message = Message.createOutbound({
        conversationId: conversation.id,
        type: input.type ?? MessageType.TEXT,
        body: input.body,
        mediaUrl: input.mediaUrl,
        sentByUserId: ctx.actor.userId,
      });
      await this.messageCommandRepo.save(message);

      try {
        const result = await this.channel.send({
          clinicId,
          toPhone: conversation.contactPhone,
          type: message.type,
          body: message.body,
          mediaUrl: message.mediaUrl,
        });
        message.markSent(result.externalId);
      } catch (err) {
        message.markFailed(err instanceof Error ? err.message : 'Gönderim hatası');
        await this.messageCommandRepo.save(message);
        throw err;
      }

      await this.messageCommandRepo.save(message);

      conversation.touch();
      await this.conversationCommandRepo.save(conversation);

      return message.id;
    });
  }
}
