import { QueryResponse } from '@shared/common/response/response.interface';
import { WorkOrderSummary } from '@modules/supply/work-order/domain/contracts/work-order.contracts';

export type GetWorkOrderSummaryResponse = QueryResponse<WorkOrderSummary>;
