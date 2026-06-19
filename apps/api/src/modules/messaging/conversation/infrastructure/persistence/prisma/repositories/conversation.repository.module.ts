import { Module } from '@nestjs/common';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { ConversationCommandRepository } from './conversation/conversation.command.repository';
import { ConversationQueryRepository } from './conversation/conversation.query.repository';
import { MessageCommandRepository } from './message/message.command.repository';
import { MessageQueryRepository } from './message/message.query.repository';

@Module({
  providers: [
    {
      provide: CONVERSATION_COMMAND_REPOSITORY,
      useClass: ConversationCommandRepository,
    },
    {
      provide: CONVERSATION_QUERY_REPOSITORY,
      useClass: ConversationQueryRepository,
    },
    { provide: MESSAGE_COMMAND_REPOSITORY, useClass: MessageCommandRepository },
    { provide: MESSAGE_QUERY_REPOSITORY, useClass: MessageQueryRepository },
  ],
  exports: [
    CONVERSATION_COMMAND_REPOSITORY,
    CONVERSATION_QUERY_REPOSITORY,
    MESSAGE_COMMAND_REPOSITORY,
    MESSAGE_QUERY_REPOSITORY,
  ],
})
export class ConversationRepositoryModule {}
