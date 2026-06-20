export type MessageDirectionValue = 'INBOUND' | 'OUTBOUND';
export type MessageTypeValue =
  | 'TEXT'
  | 'TEMPLATE'
  | 'MEDIA'
  | 'INTERACTIVE'
  | 'LOCATION'
  | 'CONTACTS'
  | 'REACTION'
  | 'UNSUPPORTED';
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
  /** interactive/location/contacts/reaction yapısal gövdesi (varsa). */
  payload: unknown;
  /** Alıntılanan mesajın wamid'i (varsa). */
  replyToExternalId: string | null;
  createdAt: Date;
}
