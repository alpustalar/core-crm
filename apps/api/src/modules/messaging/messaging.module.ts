import { Module } from '@nestjs/common';
import { WhatsappChannelPresentationModule } from './channel-config/presentation/whatsapp-channel.presentation.module';
import { ConversationPresentationModule } from './conversation/presentation/conversation.presentation.module';

/**
 * Messaging bounded-context: çok kanallı (şimdilik WhatsApp) yazışma. İki alt-bağlam:
 * channel-config (klinik WhatsApp satellite) + conversation (kanal-bağımsız çekirdek +
 * webhook). Kanal gönderimi soyut MessageChannelPort üzerinden (şimdilik stub). AI sohbet
 * desteği ayrı bir turda MessageReceivedEvent'e abone olacak.
 */
@Module({
  imports: [
    WhatsappChannelPresentationModule,
    ConversationPresentationModule,
  ],
})
export class MessagingModule {}
