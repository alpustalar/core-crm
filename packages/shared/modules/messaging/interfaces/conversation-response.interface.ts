export type MessageChannelValue = 'WHATSAPP';
export type ConversationStatusValue = 'OPEN' | 'PENDING' | 'CLOSED';

export interface ConversationResponse {
  id: string;
  clinicId: string;
  channel: MessageChannelValue;
  contactPhone: string;
  contactName: string | null;
  patientId: string | null;
  leadId: string | null;
  status: ConversationStatusValue;
  assignedUserId: string | null;
  lastMessageAt: Date | null;
  /** Ajanın henüz okumadığı gelen mesaj sayısı. */
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
