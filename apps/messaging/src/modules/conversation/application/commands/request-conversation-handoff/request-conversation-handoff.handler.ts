import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
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
    private readonly conversationCommandRepo: IConversationCommandRepository,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: RequestConversationHandoffCommand): Promise<void> {
    // Devir talebi AI akışıyla yarışır (aynı yazışmaya eşzamanlı yazım) — okuma
    // kilit altında ve transaction içinde yapılır.
    await this.txManager.run(async () => {
      const conversation = await this.conversationCommandRepo.findByIdForUpdate(
        command.payload.conversationId
      );
      if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
      if (conversation.clinicId !== command.payload.clinicId) {
        throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
      }

      conversation.requestHumanHandoff();
      await this.conversationCommandRepo.update(conversation);
    });
  }
}
