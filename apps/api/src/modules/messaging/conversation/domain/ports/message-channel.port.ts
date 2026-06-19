import { MessageType } from '@prisma/client';

export const MESSAGE_CHANNEL_PORT = Symbol('MessageChannelPort');

export interface SendMessageRequest {
  /** Hangi kliniğin kanalından gönderileceği (credential routing). */
  clinicId: string;
  /** Alıcı E.164 telefon numarası. */
  toPhone: string;
  type: MessageType;
  body?: string | null;
  mediaUrl?: string | null;
}

export interface SendMessageResult {
  /** Kanal sağlayıcısının ürettiği mesaj id'si (WhatsApp message id). */
  externalId: string;
}

/**
 * Giden mesajı bir kanala (WhatsApp Cloud API / BSP) ileten soyut port. Çekirdek bu
 * port'a bağlıdır; gerçek sağlayıcı adapter'ı infrastructure'da takılır. İlk turda
 * StubMessageChannelAdapter kullanılır (e-Document Noop deseni).
 */
export interface MessageChannelPort {
  send(request: SendMessageRequest): Promise<SendMessageResult>;
}
