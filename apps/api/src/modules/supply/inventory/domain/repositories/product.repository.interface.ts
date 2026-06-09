import { Pagination } from '@shared';
import { Product } from '../entities/product.entity';
import { StockLevel } from '../types/stock-level.type';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const PRODUCT_COMMAND_REPOSITORY = Symbol('IProductCommandRepository');
export const PRODUCT_QUERY_REPOSITORY = Symbol('IProductQueryRepository');

export interface IProductCommandRepository
  extends IBaseCommandRepository<Product> {}

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
