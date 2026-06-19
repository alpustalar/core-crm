import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetConversationsHandler } from './get-conversations/get-conversations.handler';
import { GetConversationMessagesHandler } from './get-conversation-messages/get-conversation-messages.handler';
import { ConversationRepositoryModule } from '@modules/messaging/conversation/infrastructure/persistence/prisma/repositories/conversation.repository.module';

const QueryHandlers = [
  GetConversationsHandler,
  GetConversationMessagesHandler,
];

@Module({
  imports: [CqrsModule, ConversationRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ConversationQueryModule {}
