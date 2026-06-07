import { Pagination } from '@shared';

export interface FindUsersByClinicIdsProps {
  pagination: Pagination;
  clinicId: string | string[];
}
