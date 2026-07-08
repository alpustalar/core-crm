import { QueryResponse } from '@shared/common/response/response.interface';
import { StockLevel } from '@modules/supply/inventory/domain/contracts/stock-movement.contracts';

export type GetLowStockAlertsResponse = QueryResponse<StockLevel[]>;
