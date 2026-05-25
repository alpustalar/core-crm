import { LeadSource, LeadStatus } from '@prisma/client';

export interface CreateLeadResponse {
  id: string;
  clinicId: string;
  source: LeadSource;
  status: LeadStatus;
}
