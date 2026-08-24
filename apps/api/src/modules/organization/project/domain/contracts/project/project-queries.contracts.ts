import { Pagination } from '@shared/common';
import { ProjectStatusType as ProjectStatus } from '@input-type-schemas/ProjectStatusSchema';

export interface FindProjectsFilter {
  clinicId: string;
  status?: ProjectStatus;
  ownerId?: string;
  search?: string;
  pagination: Pagination;
}
