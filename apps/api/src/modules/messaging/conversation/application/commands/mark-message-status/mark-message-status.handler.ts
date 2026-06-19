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
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkMessageStatusCommand): Promise<void> {
    const message = await this.messageQueryRepo.findByExternalId(
      command.externalId
    );
    // Bilinmeyen mesaj / bizim göndermediğimiz olay → yok say.
    if (!message) return;

    this.applyStatus(message, command.status, command.errorReason);

    await this.txManager.run(() => this.messageCommandRepo.save(message));
  }

  private applyStatus(
    message: Message,
    status: MessageStatus,
    errorReason?: string | null
  ): void {
    switch (status) {
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
        message.markFailed(errorReason ?? undefined);
        break;
      default:
        break;
    }
  }
}
