import { QueryResponse } from '@shared/common/response/response.interface';
import { StockLevel } from '@modules/supply/inventory/domain/supply.contracts';

export type GetProductStockResponse = QueryResponse<StockLevel[]>;
