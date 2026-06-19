import { ConversationStatus, MessageChannel } from '@prisma/client';
import { Pagination } from '@shared';

export interface FindConversationsFilter {
  clinicId: string;
  status?: ConversationStatus;
  assignedUserId?: string;
  pagination: Pagination;
}

export interface FindConversationByContactProps {
  clinicId: string;
  channel: MessageChannel;
  contactPhone: string;
}
