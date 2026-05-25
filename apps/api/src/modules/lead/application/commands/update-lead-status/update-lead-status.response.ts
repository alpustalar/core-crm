import { LeadStatus } from '@prisma/client';

export interface UpdateLeadStatusResponse {
  id: string;
  status: LeadStatus;
}
