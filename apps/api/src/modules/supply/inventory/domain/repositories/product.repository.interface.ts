import { Pagination } from '@shared';
import { Product } from '../entities/product.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { StockLevel } from '@modules/supply/inventory/domain/supply.contracts';

export const PRODUCT_COMMAND_REPOSITORY = Symbol('IProductCommandRepository');
export const PRODUCT_QUERY_REPOSITORY = Symbol('IProductQueryRepository');

export type IProductCommandRepository = IBaseCommandRepository<Product>;

export interface IProductQueryRepository {
  findById(id: string): Promise<Product | null>;
  findByStockCode(
    stockCode: string,
    organizationId: string
  ): Promise<Product | null>;
  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: Product[]; total: number }>;
  getStockLevels(clinicId: string): Promise<StockLevel[]>;
  getLowStockAlerts(clinicId: string): Promise<StockLevel[]>;
}
