import { Module } from '@nestjs/common';
import { PRODUCT_CATEGORY_COMMAND_REPOSITORY } from '@modules/supply/inventory/domain/repositories/product-category.repository.interface';
import { ProductCategoryCommandRepository } from './product-category.command.repository';

@Module({
  providers: [
    {
      provide: PRODUCT_CATEGORY_COMMAND_REPOSITORY,
      useClass: ProductCategoryCommandRepository,
    },
  ],
  exports: [PRODUCT_CATEGORY_COMMAND_REPOSITORY],
})
export class ProductCategoryRepositoryModule {}
