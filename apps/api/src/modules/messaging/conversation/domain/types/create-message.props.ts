import { MessageType } from '@prisma/client';

/** Zengin gelen mesaj tiplerinin yapısal gövdesi (Message.payload Json kolonuna yazılır). */
export type InboundMessagePayload =
  | {
      kind: 'interactive';
      interactiveType: 'button_reply' | 'list_reply';
      replyId: string;
      title: string | null;
    }
  | {
      kind: 'location';
      latitude: number;
      longitude: number;
      name: string | null;
      address: string | null;
    }
  | { kind: 'contacts'; contacts: unknown[] }
  | { kind: 'reaction'; emoji: string | null; targetExternalId: string };

export interface CreateInboundMessageProps {
  id?: string;
  conversationId: string;
  body?: string | null;
  mediaUrl?: string | null;
  type?: MessageType;
  externalId?: string | null;
  /** interactive/location/contacts/reaction yapısal gövdesi. */
  payload?: InboundMessagePayload | null;
  /** Alıntılanan mesajın wamid'i (context.id). */
  replyToExternalId?: string | null;
}

export type TemplateHeaderMediaType = 'image' | 'video' | 'document';

/** Şablon (HSM) bileşen değişkenleri — body/header/buton. Message.templateParams'a yazılır. */
export interface MessageTemplateComponents {
  /** body component sıralı değişkenleri. */
  bodyParams?: string[];
  /** header text component değişkeni. */
  headerText?: string;
  /** header media (image/video/document) link'i. */
  headerMediaUrl?: string;
  headerMediaType?: TemplateHeaderMediaType;
  /** dinamik URL buton suffix'leri (buton index sırasına göre). */
  urlButtonParams?: string[];
}

export interface MessageTemplateProps {
  name: string;
  language: string;
  components?: MessageTemplateComponents;
}

export type OutboundMediaType =
  | 'image'
  | 'document'
  | 'video'
  | 'audio'
  | 'sticker';

export interface CreateOutboundMessageProps {
  id?: string;
  conversationId: string;
  body?: string | null;
  mediaUrl?: string | null;
  type?: MessageType;
  /** MEDIA gönderiminde alt-tip (image/document/video/audio/sticker). */
  mediaType?: OutboundMediaType | null;
  sentByUserId?: string | null;
  template?: MessageTemplateProps;
}
