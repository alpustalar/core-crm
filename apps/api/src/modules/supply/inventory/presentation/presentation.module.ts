import { Module } from '@nestjs/common';
import { ProductController } from '@modules/supply/inventory/presentation/http/controllers/product.controller';
import { SupplierController } from '@modules/supply/inventory/presentation/http/controllers/supplier.controller';
import { ProductCategoryController } from '@modules/supply/inventory/presentation/http/controllers/product-category.controller';
import { StockController } from '@modules/supply/inventory/presentation/http/controllers/stock.controller';

@Module({
  controllers: [
    ProductController,
    SupplierController,
    ProductCategoryController,
    StockController,
  ],
})
export class InventoryPresentationModule {}
