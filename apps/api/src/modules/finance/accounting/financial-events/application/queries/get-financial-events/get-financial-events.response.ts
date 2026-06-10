import { QueryResponse } from '@shared/common/response/response.interface';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';

export type GetFinancialEventsResponse = QueryResponse<FinancialEvent[]>;
