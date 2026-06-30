import { Injectable, Logger } from '@nestjs/common';
import { MessageChannel, MessageType } from '@prisma/client';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetInstagramChannelCredentialsQuery } from '@modules/messaging/channel-config/application/queries/get-instagram-channel-credentials/get-instagram-channel-credentials.query';
import { InstagramChannelCredentials } from '@modules/messaging/channel-config/application/queries/get-instagram-channel-credentials/get-instagram-channel-credentials.response';
import {
  MessageChannelPort,
  SendMessageRequest,
  SendMessageResult,
} from '@modules/messaging/conversation/domain/ports/message-channel.port';
import {
  INSTAGRAM_GRAPH_API_BASE,
  INSTAGRAM_SEND_TIMEOUT_MS,
} from './instagram-graph.constants';

interface IgSendResponse {
  message_id?: string;
  recipient_id?: string;
  error?: { message?: string; code?: number };
}

/** WhatsApp medya alt-tipi → Instagram attachment tipi eşlemesi. */
const ATTACHMENT_TYPE_MAP: Record<string, string> = {
  image: 'image',
  photo: 'image',
  video: 'video',
  audio: 'audio',
  voice: 'audio',
  document: 'file',
  sticker: 'image',
};

/**
 * Instagram DM gönderim adapter'ı (MessageChannelPort). Klinik credential'ını (igUserId +
 * decrypted accessToken) internal query ile çözer; Graph API `/{igUserId}/messages` endpoint'ine
 * `{ recipient: { id: IGSID }, message }` POST atar. toPhone alanı IGSID'dir (kontak kimliği).
 * Instagram read-receipt (mark_seen) alıcı IGSID'sini gerektirir; port bu bilgiyi taşımadığı
 * için markRead no-op'tur.
 */
@Injectable()
export class InstagramChannelAdapter implements MessageChannelPort {
  private readonly logger = new Logger(InstagramChannelAdapter.name);

  constructor(private readonly queryBus: TSQueryBus) {}

  async send(request: SendMessageRequest): Promise<SendMessageResult> {
    const { data: credentials } = await this.queryBus.execute(
      new GetInstagramChannelCredentialsQuery(request.clinicId)
    );
    if (!credentials) {
      throw new Error(
        `Instagram credential'ı yok/pasif: clinicId=${request.clinicId}`
      );
    }

    const message = this.buildMessage(request);
    return this.post(credentials, request.toPhone, message);
  }

  /** Instagram Bot API'de read-receipt alıcı IGSID'si gerektirir (port taşımaz) → no-op. */
  markRead(
    _channel: MessageChannel,
    _clinicId: string,
    _externalMessageId: string
  ): Promise<void> {
    return Promise.resolve();
  }

  /** Mesaj tipine göre Instagram `message` gövdesini kurar (TEXT / MEDIA attachment). */
  private buildMessage(request: SendMessageRequest): Record<string, unknown> {
    switch (request.type) {
      case MessageType.TEXT:
        return { text: request.body ?? '' };
      case MessageType.MEDIA: {
        if (!request.mediaUrl) {
          throw new Error('Instagram MEDIA gönderimi için mediaUrl zorunlu.');
        }
        const type = ATTACHMENT_TYPE_MAP[request.mediaType ?? 'image'] ?? 'image';
        return {
          attachment: {
            type,
            payload: { url: request.mediaUrl, is_reusable: false },
          },
        };
      }
      default:
        // TEMPLATE/INTERACTIVE vb. Instagram DM bu soyutlamayla desteklenmiyor.
        throw new Error(
          `Instagram'da desteklenmeyen mesaj tipi: ${request.type}`
        );
    }
  }

  private async post(
    credentials: InstagramChannelCredentials,
    recipientId: string,
    message: Record<string, unknown>
  ): Promise<SendMessageResult> {
    const url = `${INSTAGRAM_GRAPH_API_BASE}/${credentials.igUserId}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient: { id: recipientId }, message }),
      signal: AbortSignal.timeout(INSTAGRAM_SEND_TIMEOUT_MS),
    });

    const json = (await res.json().catch(() => ({}))) as IgSendResponse;

    if (!res.ok || !json.message_id) {
      const reason = json.error?.message ?? `HTTP ${res.status}`;
      this.logger.error(`Instagram gönderim hatası: ${reason}`);
      throw new Error(`Instagram gönderim hatası: ${reason}`);
    }

    return { externalId: json.message_id };
  }
}
