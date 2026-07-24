import { Pagination } from '@shared';
import { Product } from '../entities/product.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { StockLevel } from '@modules/supply/inventory/domain/contracts/stock-movement.contracts';

export const PRODUCT_COMMAND_REPOSITORY = Symbol('IProductCommandRepository');
export const PRODUCT_QUERY_REPOSITORY = Symbol('IProductQueryRepository');

export interface IProductCommandRepository
  extends IBaseCommandRepository<Product> {
  /**
   * Ürünü `FOR UPDATE` ile kilitleyerek yükler — o ürüne ait eşzamanlı stok
   * değişimlerini (batch quantity oku-değiştir-yaz) serialize eder, lost-update'i
   * önler. Yalnız aktif transaction içinde çağrılır.
   */
  findByIdForUpdate(id: string): Promise<Product | null>;
}

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
