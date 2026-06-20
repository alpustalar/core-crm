import { Pagination } from '@shared';
import { FinancialEvent } from '../entities/financial-event.entity';
import { FindFinancialEventsFilter } from '@modules/finance/accounting/financial-events/domain/financial-events.contracts';

export const FINANCIAL_EVENT_COMMAND_REPOSITORY = Symbol(
  'IFinancialEventCommandRepository'
);
export const FINANCIAL_EVENT_QUERY_REPOSITORY = Symbol(
  'IFinancialEventQueryRepository'
);

export interface IFinancialEventCommandRepository {
  /** Append-only: yalnızca yeni olay ekler, update yok. */
  append(event: FinancialEvent): Promise<FinancialEvent>;
}

export interface IFinancialEventQueryRepository {
  findById(id: string): Promise<FinancialEvent | null>;
  findByDedupeKey(dedupeKey: string): Promise<FinancialEvent | null>;
  findMany(
    filter: FindFinancialEventsFilter,
    pagination: Pagination
  ): Promise<{ items: FinancialEvent[]; total: number }>;
}
