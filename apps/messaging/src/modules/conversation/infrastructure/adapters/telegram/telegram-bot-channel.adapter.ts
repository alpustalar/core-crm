import { Injectable } from '@nestjs/common';
import { MessageChannel, MessageType } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetTelegramChannelCredentialsQuery } from '@modules/channel-config/application/queries/get-telegram-channel-credentials/get-telegram-channel-credentials.query';
import {
  ITelegramBotApi,
  TELEGRAM_BOT_API,
  TelegramSendMediaKind,
} from '@modules/channel-config/domain/interfaces/telegram-bot-api.interface';
import { Inject } from '@nestjs/common';
import {
  MessageChannelPort,
  SendMessageRequest,
  SendMessageResult,
} from '@modules/conversation/domain/ports/message-channel.port';

/** WhatsApp medya alt-tipi → Telegram Bot API gönderim metodu eşlemesi. */
const MEDIA_KIND_MAP: Record<string, TelegramSendMediaKind> = {
  image: 'photo',
  photo: 'photo',
  video: 'video',
  audio: 'audio',
  voice: 'audio',
  document: 'document',
  sticker: 'document',
};

/**
 * Telegram Bot API gönderim adapter'ı (MessageChannelPort). Klinik bot token'ını internal
 * query ile çözer, toPhone alanını Telegram chatId olarak kullanır. Telegram'da onaylı
 * şablon (TEMPLATE) ve 24s pencere kavramı yoktur; TEXT/MEDIA serbesttir. Read-receipt
 * (markRead) bot API'de bulunmadığından no-op'tur.
 */
@Injectable()
export class TelegramBotChannelAdapter implements MessageChannelPort {
  constructor(
    private readonly queryBus: TSQueryBus,
    @Inject(TELEGRAM_BOT_API)
    private readonly botApi: ITelegramBotApi
  ) {}

  async send(request: SendMessageRequest): Promise<SendMessageResult> {
    const { data: credentials } = await this.queryBus.execute(
      new GetTelegramChannelCredentialsQuery(request.clinicId)
    );
    if (!credentials) {
      throw new Error(
        `Telegram credential'ı yok/pasif: clinicId=${request.clinicId}`
      );
    }

    const chatId = request.toPhone;

    switch (request.type) {
      case MessageType.TEXT: {
        const { messageId } = await this.botApi.sendMessage(
          credentials.botToken,
          chatId,
          request.body ?? ''
        );
        return { externalId: messageId };
      }
      case MessageType.MEDIA: {
        if (!request.mediaUrl) {
          throw new Error('Telegram MEDIA gönderimi için mediaUrl zorunlu.');
        }
        const kind =
          MEDIA_KIND_MAP[request.mediaType ?? 'document'] ?? 'document';
        const { messageId } = await this.botApi.sendMedia({
          botToken: credentials.botToken,
          chatId,
          kind,
          fileUrl: request.mediaUrl,
          caption: request.body,
        });
        return { externalId: messageId };
      }
      default:
        // TEMPLATE/INTERACTIVE/LOCATION vb. Telegram Bot API'de bu soyutlamayla
        // desteklenmiyor; çağıran (kuyruk) FAILED olarak işaretler.
        throw new Error(
          `Telegram'da desteklenmeyen mesaj tipi: ${request.type}`
        );
    }
  }

  /** Telegram Bot API'de okundu bilgisi gönderilemez → sessiz no-op (best-effort). */
  markRead(
    _channel: MessageChannel,
    _clinicId: string,
    _externalMessageId: string
  ): Promise<void> {
    return Promise.resolve();
  }
}
