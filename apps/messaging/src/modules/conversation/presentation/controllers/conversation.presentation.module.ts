import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { ConversationCommandModule } from '@modules/conversation/application/commands/command.module';
import { ConversationQueryModule } from '@modules/conversation/application/queries/query.module';
import { TelegramChannelQueryModule } from '@modules/channel-config/application/queries/telegram-channel-query.module';
import { InstagramChannelQueryModule } from '@modules/channel-config/application/queries/instagram-channel-query.module';

@Module({
  imports: [
    ConversationCommandModule,
    ConversationQueryModule,
    // Webhook routing query'leri (GetTelegramInboundRoutingQuery /
    // FindInstagramChannelByIgUserIdQuery) bus'a kayıtlı olmalı.
    TelegramChannelQueryModule,
    InstagramChannelQueryModule,
  ],
  controllers: [
    ConversationController,
    WhatsappWebhookController,
    TelegramWebhookController,
    InstagramWebhookController,
  ],
})
export class ConversationPresentationModule {}
