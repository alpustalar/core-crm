import { Pagination } from '@shared';

export interface FindUsersByOrganizationIdsData {
  pagination: Pagination;
  organizationId: string | string[];
}
