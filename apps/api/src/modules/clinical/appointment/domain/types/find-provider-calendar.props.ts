import { Pagination } from '@shared';

export interface FindProviderCalendarProps {
  pagination: Pagination;
  providerId: string;
  startDate: Date;
  endDate: Date;
}
