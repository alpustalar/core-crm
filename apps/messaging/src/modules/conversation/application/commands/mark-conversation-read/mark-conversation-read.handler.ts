import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/conversation/domain/repositories/conversation.repository';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import {
  MESSAGE_CHANNEL_PORT,
  MessageChannelPort,
} from '@modules/conversation/domain/ports/message-channel.port';
import { MarkConversationReadCommand } from './mark-conversation-read.command';

@CommandHandler(MarkConversationReadCommand)
export class MarkConversationReadHandler implements ICommandHandler<
  MarkConversationReadCommand,
  void
> {
  private readonly logger = new Logger(MarkConversationReadHandler.name);

  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository,
    @Inject(MESSAGE_CHANNEL_PORT)
    private readonly channel: MessageChannelPort,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: MarkConversationReadCommand): Promise<void> {
    const { clinicId, conversationId } = command.payload;

    // Kanaldaki okundu işareti için gereken dış id — salt okuma, bir mutasyona
    // karar vermiyor, kilit gerekmez.
    const externalId =
      await this.messageQueryRepo.findLatestInboundExternalId(conversationId);

    // `unreadCount` sıfırlaması, eşzamanlı gelen mesajın artırımıyla yarışır:
    // okuma da kilit altında ve aynı transaction'da yapılır.
    const channel = await this.txManager.run(async () => {
      const conversation =
        await this.conversationCommandRepo.findByIdForUpdate(conversationId);
      if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
      if (conversation.clinicId !== clinicId) {
        throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
      }

      conversation.markAgentRead();
      await this.conversationCommandRepo.update(conversation);

      return conversation.channel;
    });

    // Kanal çağrısı (dış HTTP) transaction'ın DIŞINDA ve commit'ten sonra: uzak
    // servisin gecikmesi DB kilidini tutmaz, hatası yerel okundu kaydını düşürmez.
    if (externalId) {
      await this.channel
        .markRead(channel, clinicId, externalId)
        .catch((err) =>
          this.logger.warn(
            `Okundu işareti gönderilemedi: ${
              err instanceof Error ? err.message : err
            }`
          )
        );
    }
  }
}
