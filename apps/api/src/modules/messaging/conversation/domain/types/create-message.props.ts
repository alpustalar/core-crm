import { MessageType } from '@prisma/client';

export interface CreateInboundMessageProps {
  id?: string;
  conversationId: string;
  body?: string | null;
  mediaUrl?: string | null;
  type?: MessageType;
  externalId?: string | null;
}

export interface CreateOutboundMessageProps {
  id?: string;
  conversationId: string;
  body?: string | null;
  mediaUrl?: string | null;
  type?: MessageType;
  sentByUserId?: string | null;
}
