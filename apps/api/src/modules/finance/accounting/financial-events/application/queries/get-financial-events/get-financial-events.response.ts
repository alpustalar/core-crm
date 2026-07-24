import { QueryResponse } from '@shared/common/response/response.interface';
import { FinancialEvent } from '@shared';

export type GetFinancialEventsResponse = QueryResponse<FinancialEvent[]>;
