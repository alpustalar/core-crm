import { Module } from '@nestjs/common';
import { InventoryCommandModule } from '@modules/supply/inventory/application/commands/command.module';
import { InventoryQueryModule } from '@modules/supply/inventory/application/queries/query.module';
import { ProductController } from './controllers/product.controller';
import { SupplierController } from './controllers/supplier.controller';
import { ProductCategoryController } from './controllers/product-category.controller';
import { StockController } from './controllers/stock.controller';

@Module({
  imports: [InventoryCommandModule, InventoryQueryModule],
  controllers: [
    ProductController,
    SupplierController,
    ProductCategoryController,
    StockController,
  ],
})
export class InventoryPresentationModule {}
