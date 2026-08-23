import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  ConversationNotFoundException,
} from '@modules/conversation/domain/exceptions/conversation.exceptions';
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
import { assertActorCanAccessClinic } from '@modules/conversation/domain/guards/clinic-access.guard-fn';

@CommandHandler(MarkConversationReadCommand)
export class MarkConversationReadHandler implements ICommandHandler<
  MarkConversationReadCommand,
  void
> {
  private readonly logger = new Logger(MarkConversationReadHandler.name);

  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationRepo: IConversationCommandRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageRepo: IMessageQueryRepository,
    @Inject(MESSAGE_CHANNEL_PORT)
    private readonly channel: MessageChannelPort,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: MarkConversationReadCommand): Promise<void> {
    const { clinicId, conversationId, ctx } = command.payload;

    assertActorCanAccessClinic(ctx.actor, clinicId);

    // Kanaldaki okundu işareti için gereken dış id — salt okuma, bir mutasyona
    // karar vermiyor, kilit gerekmez.
    const externalId =
      await this.messageRepo.findLatestInboundExternalId(conversationId);

    // `unreadCount` sıfırlaması, eşzamanlı gelen mesajın artırımıyla yarışır:
    // okuma da kilit altında ve aynı transaction'da yapılır.
    const channel = await this.txManager.run(async () => {
      const conversation =
        await this.conversationRepo.findByIdForUpdate(conversationId);
      // Başka kliniğe ait yazışma da "bulunamadı" sayılır: aktörün bu kliniğe
      // erişimi yukarıda doğrulandı, kaydın varlığını sızdırmanın anlamı yok.
      if (!conversation || conversation.clinicId !== clinicId) {
        throw new ConversationNotFoundException();
      }

      conversation.markAgentRead();
      await this.conversationRepo.update(conversation);

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
