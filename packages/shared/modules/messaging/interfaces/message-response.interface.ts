export type MessageDirectionValue = 'INBOUND' | 'OUTBOUND';
export type MessageTypeValue = 'TEXT' | 'TEMPLATE' | 'MEDIA';
export type MessageStatusValue =
  | 'RECEIVED'
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED';

export interface MessageResponse {
  id: string;
  conversationId: string;
  direction: MessageDirectionValue;
  type: MessageTypeValue;
  body: string | null;
  mediaUrl: string | null;
  status: MessageStatusValue;
  externalId: string | null;
  errorReason: string | null;
  sentByUserId: string | null;
  createdAt: Date;
}
