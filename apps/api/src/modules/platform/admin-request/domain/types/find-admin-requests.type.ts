import { Pagination } from '@shared';
import { AdminRequestStatus, AdminRequestType } from '@prisma/client';

export interface FindAdminRequestsFilter {
  type?: AdminRequestType;
  status?: AdminRequestStatus;
  organizationId?: string;
  pagination: Pagination;
}
