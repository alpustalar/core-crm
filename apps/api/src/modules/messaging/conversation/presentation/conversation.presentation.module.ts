import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { ConversationCommandModule } from '@modules/messaging/conversation/application/commands/command.module';
import { ConversationQueryModule } from '@modules/messaging/conversation/application/queries/query.module';

@Module({
  imports: [ConversationCommandModule, ConversationQueryModule],
  controllers: [ConversationController, WhatsappWebhookController],
})
export class ConversationPresentationModule {}
