import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IMessageCommandRepository,
  MESSAGE_COMMAND_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { MarkMessageStatusCommand } from './mark-message-status.command';

@CommandHandler(MarkMessageStatusCommand)
export class MarkMessageStatusHandler implements ICommandHandler<
  MarkMessageStatusCommand,
  void
> {
  constructor(
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageCommandRepo: IMessageCommandRepository,
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkMessageStatusCommand): Promise<void> {
    const { payload } = command;

    // Teslim webhook'ları (sent/delivered/read/failed) aynı mesaj için eşzamanlı ve
    // sırasız gelir; `transitionStatus` yalnız ileri yönde ilerlediği için okumanın
    // güncel durumu görmesi şart. Bu yüzden okuma transaction içinde ve kilitli.
    await this.txManager.run(async () => {
      const message = await this.messageCommandRepo.findByExternalIdForUpdate(
        payload.externalId
      );
      // bilinmeyen mesaj - bizim göndermediğimiz olay ise --->>> yoksay
      if (!message) return;

      this.applyStatus(message, payload);
      message.recordPricing(
        payload.pricing?.category,
        payload.pricing?.billable
      );

      await this.messageCommandRepo.update(message);

      // Konuşma penceresi bitişi geldiyse yazışmaya yaz (yalnız pencere açıldığında gelir).
      if (payload.pricing?.windowExpiresAt) {
        const conversation =
          await this.conversationCommandRepo.findByIdForUpdate(
            message.conversationId
          );
        if (conversation) {
          conversation.setWindowExpiry(payload.pricing.windowExpiresAt);
          await this.conversationCommandRepo.update(conversation);
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
