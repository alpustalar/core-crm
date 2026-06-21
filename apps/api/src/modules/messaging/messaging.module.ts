import { Module } from '@nestjs/common';
import { WhatsappChannelPresentationModule } from './channel-config/presentation/whatsapp-channel.presentation.module';
import { ConversationPresentationModule } from './conversation/presentation/conversation.presentation.module';
import { AiAgentPresentationModule } from './ai-agent/presentation/ai-agent.presentation.module';
import { AiReplyModule } from './ai-agent/infrastructure/ai-reply.module';

/**
 * Messaging bounded-context: çok kanallı (şimdilik WhatsApp) yazışma. Alt-bağlamlar:
 * channel-config (klinik WhatsApp satellite) + conversation (kanal-bağımsız çekirdek +
 * webhook) + ai-agent (klinik başına AI sohbet asistanı). Kanal gönderimi soyut
 * MessageChannelPort üzerinden; AI yanıtı MessageReceivedEvent'e abone olup kuyruğa düşer.
 */
@Module({
  imports: [
    WhatsappChannelPresentationModule,
    ConversationPresentationModule,
    AiAgentPresentationModule,
    AiReplyModule,
  ],
})
export class MessagingModule {}
