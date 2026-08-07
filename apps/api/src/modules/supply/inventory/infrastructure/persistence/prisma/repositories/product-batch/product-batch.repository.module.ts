import { Module } from '@nestjs/common';
import { PRODUCT_BATCH_COMMAND_REPOSITORY } from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import { ProductBatchCommandRepository } from './product-batch.command.repository';

@Module({
  providers: [
    {
      provide: PRODUCT_BATCH_COMMAND_REPOSITORY,
      useClass: ProductBatchCommandRepository,
    },
  ],
  exports: [PRODUCT_BATCH_COMMAND_REPOSITORY],
})
export class ProductBatchRepositoryModule {}
