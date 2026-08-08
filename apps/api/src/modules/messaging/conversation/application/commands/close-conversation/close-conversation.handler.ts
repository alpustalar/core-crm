import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { CloseConversationCommand } from './close-conversation.command';

@CommandHandler(CloseConversationCommand)
export class CloseConversationHandler implements ICommandHandler<
  CloseConversationCommand,
  void
> {
  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: CloseConversationCommand): Promise<void> {
    // Kapatma kararı kilit altında okunan güncel duruma dayanır: eşzamanlı gelen
    // mesaj yazışmayı OPEN'a çektiyse kapanış onun üstüne yazmaz, sıraya girer.
    await this.txManager.run(async () => {
      const conversation = await this.conversationCommandRepo.findByIdForUpdate(
        command.payload.conversationId
      );
      if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
      if (conversation.clinicId !== command.payload.clinicId) {
        throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
      }

      conversation.close();
      await this.conversationCommandRepo.update(conversation);
    });
  }
}
