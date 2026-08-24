import { Pagination, Product as IProduct } from '@shared';
import { StockLevel } from '@modules/supply/inventory/domain/contracts';

export const PRODUCT_QUERY_REPOSITORY = Symbol('IProductQueryRepository');

export interface IProductQueryRepository {
  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: IProduct[]; total: number }>;
  getStockLevels(clinicId: string): Promise<StockLevel[]>;
  getLowStockAlerts(clinicId: string): Promise<StockLevel[]>;
}
