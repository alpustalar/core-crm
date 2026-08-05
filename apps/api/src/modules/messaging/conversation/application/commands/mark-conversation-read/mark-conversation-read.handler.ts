import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import {
  MESSAGE_CHANNEL_PORT,
  MessageChannelPort,
} from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { MarkConversationReadCommand } from './mark-conversation-read.command';

@CommandHandler(MarkConversationReadCommand)
export class MarkConversationReadHandler implements ICommandHandler<
  MarkConversationReadCommand,
  void
> {
  private readonly logger = new Logger(MarkConversationReadHandler.name);

  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository,
    @Inject(MESSAGE_CHANNEL_PORT)
    private readonly channel: MessageChannelPort,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkConversationReadCommand): Promise<void> {
    const { clinicId, conversationId } = command.payload;

    const conversation =
      await this.conversationQueryRepo.findById(conversationId);
    if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
    if (conversation.clinicId !== clinicId) {
      throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
    }

    // En güncel gelen mesajı kanalda okundu işaretle (best-effort — bloklamaz).
    const externalId =
      await this.messageQueryRepo.findLatestInboundExternalId(conversationId);
    if (externalId) {
      await this.channel
        .markRead(conversation.channel, clinicId, externalId)
        .catch((err) =>
          this.logger.warn(
            `Okundu işareti gönderilemedi: ${
              err instanceof Error ? err.message : err
            }`
          )
        );
    }

    conversation.markAgentRead();
    await this.txManager.run(() =>
      this.conversationCommandRepo.update(conversation)
    );
  }
}
