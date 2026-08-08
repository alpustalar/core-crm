import { Module } from '@nestjs/common';
import { ProductCommandRepository } from './product.command.repository';
import { ProductQueryRepository } from './product.query.repository';
import { PRODUCT_COMMAND_REPOSITORY } from '@modules/supply/inventory/domain/repositories/product/product.command.repository';
import { PRODUCT_QUERY_REPOSITORY } from '@modules/supply/inventory/domain/repositories/product/product.query.repository';

@Module({
  providers: [
    { provide: PRODUCT_COMMAND_REPOSITORY, useClass: ProductCommandRepository },
    { provide: PRODUCT_QUERY_REPOSITORY, useClass: ProductQueryRepository },
  ],
  exports: [PRODUCT_COMMAND_REPOSITORY, PRODUCT_QUERY_REPOSITORY],
})
export class ProductRepositoryModule {}
