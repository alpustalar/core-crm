import { QueryResponse } from '@shared/common/response/response.interface';
import { StockLevel } from '@modules/inventory/domain/types/stock-level.type';

export type GetLowStockAlertsResponse = QueryResponse<StockLevel[]>;
