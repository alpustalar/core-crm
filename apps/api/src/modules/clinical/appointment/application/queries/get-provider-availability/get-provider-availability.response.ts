import { QueryResponse } from '@shared/common/response/response.interface';
import { ProviderCalendarDayResponse } from '@shared';

export type GetProviderAvailabilityQueryResponse = QueryResponse<
  ProviderCalendarDayResponse[]
>;
