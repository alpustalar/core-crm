import { Injectable } from '@nestjs/common';
import { MessageChannel } from '@prisma/client';
import {
  MessageChannelPort,
  SendMessageRequest,
  SendMessageResult,
} from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { MetaWhatsappChannelAdapter } from '@modules/messaging/conversation/infrastructure/adapters/meta/meta-whatsapp-channel.adapter';
import { TelegramBotChannelAdapter } from '@modules/messaging/conversation/infrastructure/adapters/telegram/telegram-bot-channel.adapter';
import { InstagramChannelAdapter } from '@modules/messaging/conversation/infrastructure/adapters/instagram/instagram-channel.adapter';

/**
 * Çok-kanal yönlendirici (MessageChannelPort). Çekirdek (delivery processor, mark-read
 * handler) tek port'a bağlıdır; bu adapter gelen isteğin `channel` alanına göre doğru
 * kanal adapter'ına (WhatsApp Meta / Telegram Bot / Instagram DM) deleje eder. Yeni kanal
 * eklemek yalnızca buraya bir dal + yeni adapter eklemek demektir.
 */
@Injectable()
export class ChannelRouterAdapter implements MessageChannelPort {
  constructor(
    private readonly whatsapp: MetaWhatsappChannelAdapter,
    private readonly telegram: TelegramBotChannelAdapter,
    private readonly instagram: InstagramChannelAdapter
  ) {}

  send(request: SendMessageRequest): Promise<SendMessageResult> {
    return this.resolve(request.channel).send(request);
  }

  markRead(
    channel: MessageChannel,
    clinicId: string,
    externalMessageId: string
  ): Promise<void> {
    return this.resolve(channel).markRead(channel, clinicId, externalMessageId);
  }

  private resolve(channel: MessageChannel): MessageChannelPort {
    switch (channel) {
      case MessageChannel.TELEGRAM:
        return this.telegram;
      case MessageChannel.INSTAGRAM:
        return this.instagram;
      default:
        return this.whatsapp;
    }
  }
}
