import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MessageStatus } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
  IMessageCommandRepository,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { MarkMessageStatusCommand } from './mark-message-status.command';

@CommandHandler(MarkMessageStatusCommand)
export class MarkMessageStatusHandler
  implements ICommandHandler<MarkMessageStatusCommand, void>
{
  constructor(
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageCommandRepo: IMessageCommandRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository,
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkMessageStatusCommand): Promise<void> {
    const message = await this.messageQueryRepo.findByExternalId(
      command.externalId
    );
    // Bilinmeyen mesaj / bizim göndermediğimiz olay → yok say.
    if (!message) return;

    this.applyStatus(message, command);
    message.recordPricing(
      command.pricing?.category,
      command.pricing?.billable
    );

    await this.txManager.run(async () => {
      await this.messageCommandRepo.save(message);

      // Konuşma penceresi bitişi geldiyse yazışmaya yaz (yalnız pencere açıldığında gelir).
      if (command.pricing?.windowExpiresAt) {
        const conversation = await this.conversationQueryRepo.findById(
          message.conversationId
        );
        if (conversation) {
          conversation.setWindowExpiry(command.pricing.windowExpiresAt);
          await this.conversationCommandRepo.save(conversation);
        }
      }
    });
  }

  private applyStatus(
    message: Message,
    command: MarkMessageStatusCommand
  ): void {
    switch (command.status) {
      case MessageStatus.SENT:
        // externalId zaten atanmış olmalı; yalnızca durum ilerletilir.
        message.markSent(message.externalId ?? '');
        break;
      case MessageStatus.DELIVERED:
        message.markDelivered();
        break;
      case MessageStatus.READ:
        message.markRead();
        break;
      case MessageStatus.FAILED:
        message.markFailed(
          command.errorReason ?? undefined,
          command.errorCode
        );
        break;
      default:
        break;
    }
  }
}
