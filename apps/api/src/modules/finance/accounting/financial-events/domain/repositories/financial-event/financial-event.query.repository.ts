import { FinancialEvent, Pagination } from '@shared';
import { FindFinancialEventsFilter } from '@modules/finance/accounting/financial-events/domain/contracts/financial-events.contracts';

export const FINANCIAL_EVENT_QUERY_REPOSITORY = Symbol(
  'IFinancialEventQueryRepository'
);

export interface IFinancialEventQueryRepository {
  findById(id: string): Promise<FinancialEvent | null>;
  findMany(
    filter: FindFinancialEventsFilter,
    pagination: Pagination
  ): Promise<{ items: FinancialEvent[]; total: number }>;
}
