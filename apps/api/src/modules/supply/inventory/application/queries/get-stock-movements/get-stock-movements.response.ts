import { QueryResponse } from '@shared/common/response/response.interface';
import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';

export type GetStockMovementsResponse = QueryResponse<{
  items: StockMovement[];
  total: number;
}>;
