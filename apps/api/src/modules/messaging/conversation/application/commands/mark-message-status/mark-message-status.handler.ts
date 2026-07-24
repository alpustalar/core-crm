import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IMessageCommandRepository,
  IMessageQueryRepository,
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
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
    const { payload } = command;
    const message = await this.messageQueryRepo.findByExternalId(
      payload.externalId
    );
    // bilinmeyen mesaj - bizim göndermediğimiz olay ise --->>> yoksay
    if (!message) return;

    this.applyStatus(message, payload);
    message.recordPricing(payload.pricing?.category, payload.pricing?.billable);

    await this.txManager.run(async () => {
      await this.messageCommandRepo.save(message);

      // Konuşma penceresi bitişi geldiyse yazışmaya yaz (yalnız pencere açıldığında gelir).
      if (payload.pricing?.windowExpiresAt) {
        const conversation = await this.conversationQueryRepo.findById(
          message.conversationId
        );
        if (conversation) {
          conversation.setWindowExpiry(payload.pricing.windowExpiresAt);
          await this.conversationCommandRepo.save(conversation);
        }
      }
    });
  }

  private applyStatus(
    message: Message,
    payload: MarkMessageStatusCommand['payload']
  ): void {
    message.transitionStatus(payload.status, {
      errorReason: payload.errorReason,
      errorCode: payload.errorCode,
      externalId: payload.externalId ?? message.externalId,
    });
  }
}
