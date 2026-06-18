import { LeadSourceType as LeadSource } from '@input-type-schemas/LeadSourceSchema';

export interface CreateLeadProps {
  id: string;
  clinicId: string;
  source: LeadSource;
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  assignedToId?: string;
  whatsAppConversationId?: string;
}
