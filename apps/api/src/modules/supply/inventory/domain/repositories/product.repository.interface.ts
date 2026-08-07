import { Pagination } from '@shared';
import { Product as IProduct } from '@shared';
import { Product } from '../entities/product.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { StockLevel } from '@modules/supply/inventory/domain/contracts/stock-movement.contracts';

export const PRODUCT_COMMAND_REPOSITORY = Symbol('IProductCommandRepository');
export const PRODUCT_QUERY_REPOSITORY = Symbol('IProductQueryRepository');

export interface IProductCommandRepository extends IBaseCommandRepository<Product> {
  /**
   * Ürünü `FOR UPDATE` ile kilitleyerek yükler — o ürüne ait eşzamanlı stok
   * değişimlerini (batch quantity oku-değiştir-yaz) serialize eder, lost-update'i
   * önler. Yalnız aktif transaction içinde çağrılır.
   */
  findByIdForUpdate(id: string): Promise<Product | null>;
}

/**
 * Okuma tarafı. Tekil ürün okumaları (stok hareketi, güncelleme, yetki kontrolü)
 * yazma kararını beslediği için Command Repo'dadır; burada yalnız listeleme ve
 * hazır stok read-model'leri kalır.
 */
export interface IProductQueryRepository {
  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: IProduct[]; total: number }>;
  getStockLevels(clinicId: string): Promise<StockLevel[]>;
  getLowStockAlerts(clinicId: string): Promise<StockLevel[]>;
}
