import { LeadSource, LeadStatus } from '@prisma/client';
import { Pagination } from '@shared/common';

export interface FindLeadsFilter {
  clinicId: string;
  status?: LeadStatus;
  source?: LeadSource;
  assignedToId?: string;
  pagination: Pagination;
}
