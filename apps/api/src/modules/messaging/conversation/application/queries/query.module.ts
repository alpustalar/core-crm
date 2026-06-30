import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetConversationsHandler } from './get-conversations/get-conversations.handler';
import { GetConversationMessagesHandler } from './get-conversation-messages/get-conversation-messages.handler';
import { GetInboundMediaHandler } from './get-inbound-media/get-inbound-media.handler';
import { GetWhatsappUsageHandler } from './get-whatsapp-usage/get-whatsapp-usage.handler';
import { GetConversationContactStateHandler } from './get-conversation-contact-state/get-conversation-contact-state.handler';
import { ConversationRepositoryModule } from '@modules/messaging/conversation/infrastructure/persistence/prisma/repositories/conversation.repository.module';

const QueryHandlers = [
  GetConversationsHandler,
  GetConversationMessagesHandler,
  GetInboundMediaHandler,
  GetWhatsappUsageHandler,
  GetConversationContactStateHandler,
];

@Module({
  imports: [CqrsModule, ConversationRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ConversationQueryModule {}
