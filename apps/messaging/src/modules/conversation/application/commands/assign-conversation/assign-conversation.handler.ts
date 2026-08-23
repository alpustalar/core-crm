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
import { AssignConversationCommand } from './assign-conversation.command';
import { assertActorCanAccessClinic } from '@modules/conversation/domain/guards/clinic-access.guard-fn';

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
    assertActorCanAccessClinic(
      command.payload.ctx.actor,
      command.payload.clinicId
    );

    // Okuma da transaction içinde ve kilitli: iki temsilci aynı anda üstlenirse
    // ikincisi ilkinin yazdığını görerek sıraya girer (son yazan kazanır değil).
    await this.txManager.run(async () => {
      const conversation = await this.conversationCommandRepo.findByIdForUpdate(
        command.payload.conversationId
      );
      // Başka kliniğe ait yazışma da "bulunamadı" sayılır: aktörün bu kliniğe
      // erişimi yukarıda doğrulandı, kaydın varlığını sızdırmanın anlamı yok.
      if (!conversation || conversation.clinicId !== command.payload.clinicId) {
        throw new ConversationNotFoundException();
      }

      conversation.assign(command.payload.assigneeUserId);
      await this.conversationCommandRepo.update(conversation);
    });
  }
}
