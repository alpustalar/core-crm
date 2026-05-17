import { Pagination } from '@shared';

export interface FindUsersByOrganizationIdsProps {
  pagination: Pagination;
  organizationId: string | string[];
}
