import { StockMovement, Pagination } from '@shared';
import { Decimal } from 'decimal.js';

/** Filter for finding stock movements. */
export interface FindStockMovementFilter {
  productId?: string;
  clinicId: string;
  batchId?: string;
  type?: string;
  direction?: string;
  startDate?: Date;
  endDate?: Date;
}

/** Stock movement read-model for query responses. */
export type StockMovementResponse = StockMovement;

/** Paginated movement results. */
export interface StockMovementPage {
  items: StockMovementResponse[];
  total: number;
  pagination: Pagination;
}

/** Current stock level snapshot. */
export interface StockLevel {
  productId: string;
  productName: string;
  stockCode: string;
  clinicId: string;
  totalQuantity: Decimal | string;
  criticalStockQty: Decimal | string;
  isBelowCritical: boolean;
}
