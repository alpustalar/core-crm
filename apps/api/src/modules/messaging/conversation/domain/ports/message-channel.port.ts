import { MessageType } from '@prisma/client';

export const MESSAGE_CHANNEL_PORT = Symbol('MessageChannelPort');

export type TemplateHeaderMediaType = 'image' | 'video' | 'document';

export interface SendMessageTemplate {
  name: string;
  language: string;
  /** body component sıralı değişkenleri. */
  bodyParams: string[];
  /** header text component değişkeni (varsa). */
  headerText?: string;
  /** header media (image/video/document) link'i (varsa). */
  headerMediaUrl?: string;
  headerMediaType?: TemplateHeaderMediaType;
  /** dinamik URL buton suffix'leri (buton index sırasına göre). */
  urlButtonParams?: string[];
}

export interface SendMessageRequest {
  /** Hangi kliniğin kanalından gönderileceği (credential routing). */
  clinicId: string;
  /** Alıcı E.164 telefon numarası. */
  toPhone: string;
  type: MessageType;
  body?: string | null;
  mediaUrl?: string | null;
  /** MEDIA gönderiminde alt-tip (image/document/video/audio/sticker); yoksa image. */
  mediaType?: string | null;
  /** type === TEMPLATE iken zorunlu (HSM gönderimi). */
  template?: SendMessageTemplate;
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
  /**
   * Gelen bir mesajı kanalda "okundu" işaretler (mavi tik). En güncel inbound mesaj
   * id'si verilir; en iyi-çaba (best-effort) — başarısızlık çağıranı bloklamaz.
   */
  markRead(clinicId: string, externalMessageId: string): Promise<void>;
}
