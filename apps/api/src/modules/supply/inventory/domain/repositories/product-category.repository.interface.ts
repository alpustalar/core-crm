import { Pagination } from '@shared';
import { ProductCategory } from '../entities/product-category.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PRODUCT_CATEGORY_COMMAND_REPOSITORY = Symbol(
  'IProductCategoryCommandRepository'
);
export const PRODUCT_CATEGORY_QUERY_REPOSITORY = Symbol(
  'IProductCategoryQueryRepository'
);

export type IProductCategoryCommandRepository =
  IBaseCommandRepository<ProductCategory>;

export interface IProductCategoryQueryRepository {
  findById(id: string): Promise<ProductCategory | null>;
  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: ProductCategory[]; total: number }>;
}
