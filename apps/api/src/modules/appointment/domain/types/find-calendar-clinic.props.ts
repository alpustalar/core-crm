import { Pagination } from '@shared';

export type FindClinicCalendarProps = {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
};
