import { Module } from '@nestjs/common';

import { FindProductsHandler } from './find-products/find-products.handler';
import { FindSuppliersHandler } from './find-suppliers/find-suppliers.handler';
import { GetLowStockAlertsHandler } from './get-low-stock-alerts/get-low-stock-alerts.handler';
import { GetProductStockHandler } from './get-product-stock/get-product-stock.handler';
import { GetStockMovementsHandler } from './get-stock-movements/get-stock-movements.handler';
import { InventoryInfrastructureModule } from '@modules/supply/inventory/infrastructure/infrastructure.module';

export const INVENTORY_QUERY_HANDLERS = [
  FindProductsHandler,
  FindSuppliersHandler,
  GetLowStockAlertsHandler,
  GetProductStockHandler,
  GetStockMovementsHandler,
];

@Module({
  imports: [InventoryInfrastructureModule],
  providers: [...INVENTORY_QUERY_HANDLERS],
})
export class InventoryQueryModule {}
