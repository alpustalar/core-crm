import { QueryResponse } from '@shared/common/response/response.interface';
import { ExternalWorkOrderWithItems } from '@modules/supply/work-order/domain/contracts';

export type GetWorkOrdersResponse = QueryResponse<ExternalWorkOrderWithItems[]>;
