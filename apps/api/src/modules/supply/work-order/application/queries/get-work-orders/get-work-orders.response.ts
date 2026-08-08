import { QueryResponse } from '@shared/common/response/response.interface';
import { ExternalWorkOrderWithItems } from '@modules/supply/work-order/domain/contracts/work-order.contracts';

export type GetWorkOrdersResponse = QueryResponse<ExternalWorkOrderWithItems[]>;
