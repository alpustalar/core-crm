import { Pagination } from '@shared';

export interface FindUsersByClinicIdsData {
  pagination: Pagination;
  clinicId: string | string[];
}
