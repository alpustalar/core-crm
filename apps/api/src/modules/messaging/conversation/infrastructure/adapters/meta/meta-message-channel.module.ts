import { Module } from '@nestjs/common';
import { MESSAGE_CHANNEL_PORT } from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { MetaWhatsappChannelAdapter } from './meta-whatsapp-channel.adapter';

/**
 * Gerçek WhatsApp Cloud API adapter bağlaması (StubMessageChannelModule'ün yerini alır).
 * Klinik credential'ı yapılandırılmamışsa adapter hata fırlatır → mesaj FAILED olur
 * (kanal başına numara; global toggle yerine credential varlığı belirler). Credential
 * query'si global TSQueryBus üzerinden çözülür.
 */
@Module({
  providers: [
    { provide: MESSAGE_CHANNEL_PORT, useClass: MetaWhatsappChannelAdapter },
  ],
  exports: [MESSAGE_CHANNEL_PORT],
})
export class MetaMessageChannelModule {}
