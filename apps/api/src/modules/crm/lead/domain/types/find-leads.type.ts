import { Pagination } from '@shared/common';
import { LeadSourceType as LeadSource } from '@input-type-schemas/LeadSourceSchema';
import { LeadStatusType as LeadStatus } from '@input-type-schemas/LeadStatusSchema';

export interface FindLeadsFilter {
  clinicId: string;
  status?: LeadStatus;
  source?: LeadSource;
  assignedToId?: string;
  pagination: Pagination;
}
