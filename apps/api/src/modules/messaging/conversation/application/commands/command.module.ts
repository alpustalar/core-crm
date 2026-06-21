import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReceiveInboundMessageHandler } from './receive-inbound-message/receive-inbound-message.handler';
import { SendMessageHandler } from './send-message/send-message.handler';
import { SendTemplateMessageHandler } from './send-template-message/send-template-message.handler';
import { MarkMessageStatusHandler } from './mark-message-status/mark-message-status.handler';
import { MarkConversationReadHandler } from './mark-conversation-read/mark-conversation-read.handler';
import { CloseConversationHandler } from './close-conversation/close-conversation.handler';
import { AssignConversationHandler } from './assign-conversation/assign-conversation.handler';
import { RequestConversationHandoffHandler } from './request-conversation-handoff/request-conversation-handoff.handler';
import { ConversationRepositoryModule } from '@modules/messaging/conversation/infrastructure/persistence/prisma/repositories/conversation.repository.module';
import { MessagingQueueModule } from '@modules/messaging/conversation/infrastructure/queue/messaging-queue.module';
import { MetaMessageChannelModule } from '@modules/messaging/conversation/infrastructure/adapters/meta/meta-message-channel.module';
import { PatientQueryModule } from '@modules/crm/patient/application/queries/query.module';

const CommandHandlers = [
  ReceiveInboundMessageHandler,
  SendMessageHandler,
  SendTemplateMessageHandler,
  MarkMessageStatusHandler,
  MarkConversationReadHandler,
  CloseConversationHandler,
  AssignConversationHandler,
  RequestConversationHandoffHandler,
];

@Module({
  imports: [
    CqrsModule,
    ConversationRepositoryModule,
    MessagingQueueModule,
    MetaMessageChannelModule,
    PatientQueryModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ConversationCommandModule {}
