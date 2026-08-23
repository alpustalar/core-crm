import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ConversationNotFoundException,
} from '@modules/conversation/domain/exceptions/conversation.exceptions';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/conversation/domain/repositories/conversation.repository';
import { RequestConversationHandoffCommand } from './request-conversation-handoff.command';

@CommandHandler(RequestConversationHandoffCommand)
export class RequestConversationHandoffHandler implements ICommandHandler<
  RequestConversationHandoffCommand,
  void
> {
  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationRepo: IConversationCommandRepository,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: RequestConversationHandoffCommand): Promise<void> {
    // Devir talebi AI akışıyla yarışır (aynı yazışmaya eşzamanlı yazım) — okuma
    // kilit altında ve transaction içinde yapılır.
    await this.txManager.run(async () => {
      const conversation = await this.conversationRepo.findByIdForUpdate(
        command.payload.conversationId
      );
      // Başka kliniğe ait yazışma da "bulunamadı" sayılır: aktörün bu kliniğe
      // erişimi yukarıda doğrulandı, kaydın varlığını sızdırmanın anlamı yok.
      if (!conversation || conversation.clinicId !== command.payload.clinicId) {
        throw new ConversationNotFoundException();
      }

      conversation.requestHumanHandoff();
      await this.conversationRepo.update(conversation);
    });
  }
}
