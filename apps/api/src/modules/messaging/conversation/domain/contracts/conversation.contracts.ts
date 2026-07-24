import { Pagination } from '@shared';
import { ConversationStatusType } from '@input-type-schemas/ConversationStatusSchema';
import { MessageChannelType } from '@input-type-schemas/MessageChannelSchema';

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
