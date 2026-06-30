import { QueryResponse } from '@shared/common/response/response.interface';
import { StockMovement } from '@shared';

export type GetStockMovementsResponse = QueryResponse<StockMovement[]>;
