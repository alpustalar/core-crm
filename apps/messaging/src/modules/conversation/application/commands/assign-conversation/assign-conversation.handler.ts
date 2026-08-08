import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/conversation/domain/repositories/conversation.repository';
import { AssignConversationCommand } from './assign-conversation.command';

@CommandHandler(AssignConversationCommand)
export class AssignConversationHandler implements ICommandHandler<
  AssignConversationCommand,
  void
> {
  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: AssignConversationCommand): Promise<void> {
    // Okuma da transaction içinde ve kilitli: iki temsilci aynı anda üstlenirse
    // ikincisi ilkinin yazdığını görerek sıraya girer (son yazan kazanır değil).
    await this.txManager.run(async () => {
      const conversation = await this.conversationCommandRepo.findByIdForUpdate(
        command.payload.conversationId
      );
      if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
      if (conversation.clinicId !== command.payload.clinicId) {
        throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
      }

      conversation.assign(command.payload.assigneeUserId);
      await this.conversationCommandRepo.update(conversation);
    });
  }
}
