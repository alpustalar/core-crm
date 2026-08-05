import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { AssignConversationCommand } from './assign-conversation.command';

@CommandHandler(AssignConversationCommand)
export class AssignConversationHandler implements ICommandHandler<
  AssignConversationCommand,
  void
> {
  constructor(
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AssignConversationCommand): Promise<void> {
    const conversation = await this.conversationQueryRepo.findById(
      command.payload.conversationId
    );
    if (!conversation) throw new NotFoundException('Yazışma bulunamadı.');
    if (conversation.clinicId !== command.payload.clinicId) {
      throw new ForbiddenException('Bu yazışmaya erişim yetkiniz yok.');
    }

    conversation.assign(command.payload.assigneeUserId);
    await this.txManager.run(() =>
      this.conversationCommandRepo.update(conversation)
    );
  }
}
