import { Module } from '@nestjs/common';
import { MESSAGE_CHANNEL_PORT } from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { StubMessageChannelAdapter } from './stub-message-channel.adapter';

/**
 * Stub kanal adapter bağlaması. Gerçek WhatsApp Cloud API / BSP adapter'ı eklenince
 * bu modül onunla değiştirilir (port arayüzü sabit kalır).
 */
@Module({
  providers: [
    { provide: MESSAGE_CHANNEL_PORT, useClass: StubMessageChannelAdapter },
  ],
  exports: [MESSAGE_CHANNEL_PORT],
})
export class StubMessageChannelModule {}
