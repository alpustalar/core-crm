import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/conversation.repository';
import {
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import {
  ConversationModel,
  ConversationSchema,
} from '../schemas/conversation.schema';
import { MessageModel, MessageSchema } from '../schemas/message.schema';
import { ConversationCommandRepository } from './conversation/conversation.command.repository';
import { ConversationQueryRepository } from './conversation/conversation.query.repository';
import { MessageCommandRepository } from './message/message.command.repository';
import { MessageQueryRepository } from './message/message.query.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: ConversationModel.name, schema: ConversationSchema },
        { name: MessageModel.name, schema: MessageSchema },
      ],
      MESSAGING_MONGO_CONNECTION
    ),
  ],
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
