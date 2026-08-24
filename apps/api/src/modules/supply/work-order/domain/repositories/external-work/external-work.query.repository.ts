import {
  ExternalWorkOrderWithItems,
  FindWorkOrdersFilter,
  WorkOrderSummary,
} from '@modules/supply/work-order/domain/contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const EXTERNAL_WORK_ORDER_QUERY_REPOSITORY = Symbol(
  'IExternalWorkOrderQueryRepository'
);

export interface IExternalWorkOrderQueryRepository {
  findById(id: string): Promise<ExternalWorkOrderWithItems | null>;
  findByClinic(
    filter: FindWorkOrdersFilter
  ): Promise<Paginated<ExternalWorkOrderWithItems>>;
  summarizeByClinic(clinicId: string, now: Date): Promise<WorkOrderSummary>;
}
