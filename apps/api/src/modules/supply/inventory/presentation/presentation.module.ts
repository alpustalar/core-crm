import { Module } from '@nestjs/common';
import {
  ProductCommandController,
  ProductQueryController,
} from '@modules/supply/inventory/presentation/http/controllers/product';
import {
  SupplierCommandController,
  SupplierQueryController,
} from '@modules/supply/inventory/presentation/http/controllers/supplier';
import { ProductCategoryCommandController } from '@modules/supply/inventory/presentation/http/controllers/product-category/product-category.command.controller';
import { StockCommandController } from '@modules/supply/inventory/presentation/http/controllers/stock/stock.command.controller';
import { StockQueryController } from '@modules/supply/inventory/presentation/http/controllers/stock/stock.query.controller';

@Module({
  controllers: [
    ProductQueryController,
    ProductCommandController,
    SupplierQueryController,
    SupplierCommandController,
    ProductCategoryCommandController,
    StockCommandController,
    StockQueryController,
  ],
})
export class InventoryPresentationModule {}
