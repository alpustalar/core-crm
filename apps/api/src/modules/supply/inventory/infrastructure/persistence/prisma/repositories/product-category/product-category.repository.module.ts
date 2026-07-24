import { Module } from '@nestjs/common';
import {
  PRODUCT_CATEGORY_COMMAND_REPOSITORY,
  PRODUCT_CATEGORY_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-category.repository.interface';
import { ProductCategoryCommandRepository } from './product-category.command.repository';
import { ProductCategoryQueryRepository } from './product-category.query.repository';

@Module({
  providers: [
    {
      provide: PRODUCT_CATEGORY_COMMAND_REPOSITORY,
      useClass: ProductCategoryCommandRepository,
    },
    {
      provide: PRODUCT_CATEGORY_QUERY_REPOSITORY,
      useClass: ProductCategoryQueryRepository,
    },
  ],
  exports: [
    PRODUCT_CATEGORY_COMMAND_REPOSITORY,
    PRODUCT_CATEGORY_QUERY_REPOSITORY,
  ],
})
export class ProductCategoryRepositoryModule {}
