import { Module } from '@nestjs/common';
import {
  PRODUCT_COMMAND_REPOSITORY,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/inventory/domain/repositories/product.repository.interface';
import { ProductCommandRepository } from './product.command.repository';
import { ProductQueryRepository } from './product.query.repository';

@Module({
  providers: [
    { provide: PRODUCT_COMMAND_REPOSITORY, useClass: ProductCommandRepository },
    { provide: PRODUCT_QUERY_REPOSITORY, useClass: ProductQueryRepository },
  ],
  exports: [PRODUCT_COMMAND_REPOSITORY, PRODUCT_QUERY_REPOSITORY],
})
export class ProductRepositoryModule {}
