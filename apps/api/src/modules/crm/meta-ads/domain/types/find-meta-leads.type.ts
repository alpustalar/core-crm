import { Pagination } from '@shared/common';
import { MetaLeadStatusType as MetaLeadStatus } from '@input-type-schemas/MetaLeadStatusSchema';

export interface FindMetaLeadsProps {
  clinicId: string;
  status?: MetaLeadStatus;
  pagination: Pagination;
}
