import { Pagination } from '@shared';
import { AdminRequestTypeType as AdminRequestType } from '@input-type-schemas/AdminRequestTypeSchema';
import { AdminRequestStatusType as AdminRequestStatus } from '@input-type-schemas/AdminRequestStatusSchema';

export interface FindAdminRequestsFilter {
  type?: AdminRequestType;
  status?: AdminRequestStatus;
  organizationId?: string;
  pagination: Pagination;
}
