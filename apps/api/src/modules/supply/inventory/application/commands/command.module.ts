import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CreateProductHandler } from './create-product/create-product.handler';
import { UpdateProductHandler } from './update-product/update-product.handler';
import { SoftDeleteProductHandler } from './soft-delete-product/soft-delete-product.handler';
import { CreateSupplierHandler } from './create-supplier/create-supplier.handler';
import { UpdateSupplierHandler } from './update-supplier/update-supplier.handler';
import { CreateProductCategoryHandler } from './create-product-category/create-product-category.handler';
import { ReceiveStockHandler } from './receive-stock/receive-stock.handler';
import { AdjustStockHandler } from './adjust-stock/adjust-stock.handler';
import { RecordProductUsageHandler } from './record-product-usage/record-product-usage.handler';

import { ProductRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/product/product.repository.module';
import { SupplierRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/supplier/supplier.repository.module';
import { ProductCategoryRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/product-category/product-category.repository.module';
import { ProductBatchRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/product-batch/product-batch.repository.module';
import { StockMovementRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/stock-movement/stock-movement.repository.module';

export const INVENTORY_COMMAND_HANDLERS = [
  CreateProductHandler,
  UpdateProductHandler,
  SoftDeleteProductHandler,
  CreateSupplierHandler,
  UpdateSupplierHandler,
  CreateProductCategoryHandler,
  ReceiveStockHandler,
  AdjustStockHandler,
  RecordProductUsageHandler,
];

@Module({
  imports: [
    CqrsModule,
    ProductRepositoryModule,
    SupplierRepositoryModule,
    ProductCategoryRepositoryModule,
    ProductBatchRepositoryModule,
    StockMovementRepositoryModule,
  ],
  providers: [...INVENTORY_COMMAND_HANDLERS],
  exports: [...INVENTORY_COMMAND_HANDLERS],
})
export class InventoryCommandModule {}
