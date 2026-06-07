import { Module } from '@nestjs/common';
import {
  PRODUCT_BATCH_COMMAND_REPOSITORY,
  PRODUCT_BATCH_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import { ProductBatchCommandRepository } from './product-batch.command.repository';
import { ProductBatchQueryRepository } from './product-batch.query.repository';

@Module({
  providers: [
    {
      provide: PRODUCT_BATCH_COMMAND_REPOSITORY,
      useClass: ProductBatchCommandRepository,
    },
    {
      provide: PRODUCT_BATCH_QUERY_REPOSITORY,
      useClass: ProductBatchQueryRepository,
    },
  ],
  exports: [PRODUCT_BATCH_COMMAND_REPOSITORY, PRODUCT_BATCH_QUERY_REPOSITORY],
})
export class ProductBatchRepositoryModule {}
