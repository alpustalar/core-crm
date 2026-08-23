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
import { CloseConversationCommand } from './close-conversation.command';
import { assertActorCanAccessClinic } from '@modules/conversation/domain/guards/clinic-access.guard-fn';

@CommandHandler(CloseConversationCommand)
export class CloseConversationHandler implements ICommandHandler<
  CloseConversationCommand,
  void
> {
  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationRepo: IConversationCommandRepository,
    private readonly txManager: MongoTransactionManager,
  ) {}

  async execute(command: CloseConversationCommand): Promise<void> {
    assertActorCanAccessClinic(
      command.payload.ctx.actor,
      command.payload.clinicId
    );

    // Kapatma kararı kilit altında okunan güncel duruma dayanır: eşzamanlı gelen
    // mesaj yazışmayı OPEN'a çektiyse kapanış onun üstüne yazmaz, sıraya girer.
    await this.txManager.run(async () => {
      const conversation = await this.conversationRepo.findByIdForUpdate(
        command.payload.conversationId
      );
      // Başka kliniğe ait yazışma da "bulunamadı" sayılır: aktörün bu kliniğe
      // erişimi yukarıda doğrulandı, kaydın varlığını sızdırmanın anlamı yok.
      if (!conversation || conversation.clinicId !== command.payload.clinicId) {
        throw new ConversationNotFoundException();
      }

      conversation.close();
      await this.conversationRepo.update(conversation);
    });
  }
}
