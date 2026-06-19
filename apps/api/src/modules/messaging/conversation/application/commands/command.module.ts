import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReceiveInboundMessageHandler } from './receive-inbound-message/receive-inbound-message.handler';
import { SendMessageHandler } from './send-message/send-message.handler';
import { MarkMessageStatusHandler } from './mark-message-status/mark-message-status.handler';
import { CloseConversationHandler } from './close-conversation/close-conversation.handler';
import { AssignConversationHandler } from './assign-conversation/assign-conversation.handler';
import { ConversationRepositoryModule } from '@modules/messaging/conversation/infrastructure/persistence/prisma/repositories/conversation.repository.module';
import { StubMessageChannelModule } from '@modules/messaging/conversation/infrastructure/adapters/stub/stub-message-channel.module';
import { PatientQueryModule } from '@modules/crm/patient/application/queries/query.module';

const CommandHandlers = [
  ReceiveInboundMessageHandler,
  SendMessageHandler,
  MarkMessageStatusHandler,
  CloseConversationHandler,
  AssignConversationHandler,
];

@Module({
  imports: [
    CqrsModule,
    ConversationRepositoryModule,
    StubMessageChannelModule,
    PatientQueryModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ConversationCommandModule {}
