import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FindProductsHandler } from './find-products/find-products.handler';
import { FindSuppliersHandler } from './find-suppliers/find-suppliers.handler';
import { GetLowStockAlertsHandler } from './get-low-stock-alerts/get-low-stock-alerts.handler';
import { GetProductStockHandler } from './get-product-stock/get-product-stock.handler';
import { GetStockMovementsHandler } from './get-stock-movements/get-stock-movements.handler';

import { ProductRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/product/product.repository.module';
import { SupplierRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/supplier/supplier.repository.module';
import { StockMovementRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/stock-movement/stock-movement.repository.module';

export const INVENTORY_QUERY_HANDLERS = [
  FindProductsHandler,
  FindSuppliersHandler,
  GetLowStockAlertsHandler,
  GetProductStockHandler,
  GetStockMovementsHandler,
];

@Module({
  imports: [
    CqrsModule,
    ProductRepositoryModule,
    SupplierRepositoryModule,
    StockMovementRepositoryModule,
  ],
  providers: [...INVENTORY_QUERY_HANDLERS],
  exports: [...INVENTORY_QUERY_HANDLERS],
})
export class InventoryQueryModule {}
