import { MetaLeadStatus } from '@prisma/client';
import { Pagination } from '@shared/common';

export interface FindMetaLeadsProps {
  clinicId: string;
  status?: MetaLeadStatus;
  pagination: Pagination;
}
