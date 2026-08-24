import { QueryResponse } from '@shared/common/response/response.interface';
import { WorkOrderSummary } from '@modules/supply/work-order/domain/contracts';

export type GetWorkOrderSummaryResponse = QueryResponse<WorkOrderSummary>;
