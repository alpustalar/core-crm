import { Module } from '@nestjs/common';
import { WhatsappChannelPresentationModule } from './channel-config/presentation/whatsapp-channel.presentation.module';
import { TelegramChannelPresentationModule } from './channel-config/presentation/telegram-channel.presentation.module';
import { InstagramChannelPresentationModule } from './channel-config/presentation/instagram-channel.presentation.module';
import { ConversationPresentationModule } from './conversation/presentation/conversation.presentation.module';
import { AiAgentPresentationModule } from './ai-agent/presentation/ai-agent.presentation.module';
import { AiReplyModule } from './ai-agent/infrastructure/ai-reply.module';

/**
 * Messaging bounded-context: çok kanallı (WhatsApp + Telegram + Instagram) yazışma.
 * Alt-bağlamlar: channel-config (klinik WhatsApp/Telegram/Instagram satellite'leri) +
 * conversation (kanal-bağımsız çekirdek + webhook'lar) + ai-agent (klinik başına AI sohbet
 * asistanı). Kanal gönderimi soyut MessageChannelPort + ChannelRouterAdapter üzerinden; AI
 * yanıtı MessageReceivedEvent'e abone olup kuyruğa düşer.
 */
@Module({
  imports: [
    WhatsappChannelPresentationModule,
    TelegramChannelPresentationModule,
    InstagramChannelPresentationModule,
    ConversationPresentationModule,
    AiAgentPresentationModule,
    AiReplyModule,
  ],
})
export class MessagingModule {}
