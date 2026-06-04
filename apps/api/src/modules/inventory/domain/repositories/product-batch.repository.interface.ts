import { ProductBatch } from '../entities/product-batch.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const PRODUCT_BATCH_COMMAND_REPOSITORY = Symbol('IProductBatchCommandRepository');
export const PRODUCT_BATCH_QUERY_REPOSITORY = Symbol('IProductBatchQueryRepository');

export interface IProductBatchCommandRepository
  extends IBaseCommandRepository<ProductBatch> {}

export interface IProductBatchQueryRepository {
  findById(id: string): Promise<ProductBatch | null>;
  findAvailableByProduct(productId: string, clinicId: string): Promise<ProductBatch[]>;
}
