import { MessageChannel } from '@prisma/client';

export interface StartConversationProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  channel?: MessageChannel;
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
