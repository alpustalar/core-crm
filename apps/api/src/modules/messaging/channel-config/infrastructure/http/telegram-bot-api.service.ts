import { Injectable, Logger } from '@nestjs/common';
import {
  ITelegramBotApi,
  TelegramBotIdentity,
  TelegramSendMediaKind,
} from '@modules/messaging/channel-config/domain/interfaces/telegram-bot-api.interface';

const TELEGRAM_API_BASE = 'https://api.telegram.org';
const TELEGRAM_TIMEOUT_MS = 10_000;

/** Telegram Bot API zarf yanıtı: { ok, result?, description?, error_code? }. */
interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
}

/** Medya alt-tipi → Bot API metodu + payload alan adı. */
const MEDIA_METHOD: Record<
  TelegramSendMediaKind,
  { method: string; field: string }
> = {
  photo: { method: 'sendPhoto', field: 'photo' },
  document: { method: 'sendDocument', field: 'document' },
  video: { method: 'sendVideo', field: 'video' },
  audio: { method: 'sendAudio', field: 'audio' },
};

/**
 * Telegram Bot API HTTP istemcisi (raw fetch). `https://api.telegram.org/bot<token>/<method>`
 * endpoint'lerine JSON POST atar; Bot API stateless olduğundan klinik başına Telegraf
 * instance'ı tutulmaz, her çağrı token'ı parametre alır.
 */
@Injectable()
export class TelegramBotApiService implements ITelegramBotApi {
  private readonly logger = new Logger(TelegramBotApiService.name);

  async getMe(botToken: string): Promise<TelegramBotIdentity> {
    const me = await this.call<TelegramUser>(botToken, 'getMe');
    return {
      id: me.id,
      username: me.username ?? null,
      firstName: me.first_name,
    };
  }

  async setWebhook(
    botToken: string,
    url: string,
    secretToken: string
  ): Promise<void> {
    await this.call(botToken, 'setWebhook', {
      url,
      secret_token: secretToken,
      // Yalnızca mesaj güncellemeleri (teslim/okundu yok; gereksiz trafiği eler).
      allowed_updates: ['message', 'edited_message'],
      drop_pending_updates: true,
    });
  }

  async deleteWebhook(botToken: string): Promise<void> {
    try {
      await this.call(botToken, 'deleteWebhook', {
        drop_pending_updates: false,
      });
    } catch (err) {
      // Disconnect best-effort: webhook silme hatası bağlantı kesmeyi bloklamamalı.
      this.logger.warn(
        `Telegram webhook silinemedi: ${
          err instanceof Error ? err.message : err
        }`
      );
    }
  }

  async sendMessage(
    botToken: string,
    chatId: string,
    text: string
  ): Promise<{ messageId: string }> {
    const msg = await this.call<TelegramMessage>(botToken, 'sendMessage', {
      chat_id: chatId,
      text,
    });
    return { messageId: String(msg.message_id) };
  }

  async sendContactRequest(
    botToken: string,
    chatId: string,
    text: string,
    buttonText: string
  ): Promise<void> {
    await this.call(botToken, 'sendMessage', {
      chat_id: chatId,
      text,
      reply_markup: {
        keyboard: [[{ text: buttonText, request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  async sendMedia(input: {
    botToken: string;
    chatId: string;
    kind: TelegramSendMediaKind;
    fileUrl: string;
    caption?: string | null;
  }): Promise<{ messageId: string }> {
    const { method, field } = MEDIA_METHOD[input.kind];
    const payload: Record<string, unknown> = {
      chat_id: input.chatId,
      [field]: input.fileUrl,
    };
    if (input.caption) payload.caption = input.caption;
    const msg = await this.call<TelegramMessage>(
      input.botToken,
      method,
      payload
    );
    return { messageId: String(msg.message_id) };
  }

  /** Tek bir Bot API metodunu çağırır; ok=false ise açıklamayla hata fırlatır. */
  private async call<T = unknown>(
    botToken: string,
    method: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${TELEGRAM_API_BASE}/bot${botToken}/${method}`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
        signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      });
    } catch (err) {
      throw new Error(
        `Telegram ${method} ağ hatası: ${
          err instanceof Error ? err.message : err
        }`
      );
    }

    const json = (await res
      .json()
      .catch(() => ({ ok: false }))) as TelegramApiResponse<T>;

    if (!res.ok || !json.ok || json.result === undefined) {
      const reason =
        json.description ??
        `HTTP ${res.status}${json.error_code ? ` (${json.error_code})` : ''}`;
      throw new Error(`Telegram ${method} hatası: ${reason}`);
    }

    return json.result;
  }
}
