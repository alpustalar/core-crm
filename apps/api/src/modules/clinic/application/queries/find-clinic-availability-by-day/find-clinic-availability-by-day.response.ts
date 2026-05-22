import { QueryResponse } from '@shared/common/response/response.interface';

export type FindClinicAvailabilityByDayQueryResponse = QueryResponse<{
  isOpen: boolean;
  workingHours: {
    startMinute: number;
    endMinute: number;
  } | null;
  reason: string | null;
}>;
