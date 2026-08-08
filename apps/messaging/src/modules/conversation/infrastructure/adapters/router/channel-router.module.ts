import { Module } from '@nestjs/common';
import { MESSAGE_CHANNEL_PORT } from '@modules/conversation/domain/ports/message-channel.port';
import { MetaWhatsappChannelAdapter } from '@modules/conversation/infrastructure/adapters/meta/meta-whatsapp-channel.adapter';
import { TelegramBotChannelAdapter } from '@modules/conversation/infrastructure/adapters/telegram/telegram-bot-channel.adapter';
import { InstagramChannelAdapter } from '@modules/conversation/infrastructure/adapters/instagram/instagram-channel.adapter';
import { TelegramBotApiModule } from '@modules/channel-config/infrastructure/http/telegram-bot-api.module';
import { ChannelRouterAdapter } from './channel-router.adapter';

/**
 * Aktif çok-kanal binding'i: MESSAGE_CHANNEL_PORT → ChannelRouterAdapter (WhatsApp Meta +
 * Telegram Bot + Instagram DM). Tek başına Meta'yı bağlayan MetaMessageChannelModule'ün
 * yerini alır. Kanal credential'ları cross-context global TSQueryBus üzerinden çözülür;
 * Telegram Bot API HTTP istemcisi için TelegramBotApiModule import edilir.
 */
@Module({
  imports: [TelegramBotApiModule],
  providers: [
    MetaWhatsappChannelAdapter,
    TelegramBotChannelAdapter,
    InstagramChannelAdapter,
    { provide: MESSAGE_CHANNEL_PORT, useClass: ChannelRouterAdapter },
  ],
  exports: [MESSAGE_CHANNEL_PORT],
})
export class ChannelRouterModule {}
