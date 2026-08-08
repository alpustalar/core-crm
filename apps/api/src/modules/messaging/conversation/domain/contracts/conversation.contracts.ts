import { Pagination } from '@shared';
import { ConversationStatusType } from '@shared';
import { MessageChannelType } from '@shared';

export interface StartConversationProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  channel?: MessageChannelType;
  contactPhone: string;
  contactName?: string | null;
  patientId?: string | null;
  leadId?: string | null;
}

export interface LinkContactProps {
  patientId?: string | null;
  leadId?: string | null;
  contactName?: string | null;
}

export interface FindConversationsFilter {
  clinicId: string;
  status?: ConversationStatusType;
  assignedUserId?: string;
  pagination: Pagination;
}

export interface FindConversationByContactProps {
  clinicId: string;
  channel: MessageChannelType;
  contactPhone: string;
}
