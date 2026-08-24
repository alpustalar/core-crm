import { Pagination } from '@shared/common';
import { MetaLeadStatusType } from '@input-type-schemas/MetaLeadStatusSchema';

export interface FindMetaLeadsFilter {
  clinicId: string;
  status?: MetaLeadStatusType;
  pagination: Pagination;
}
