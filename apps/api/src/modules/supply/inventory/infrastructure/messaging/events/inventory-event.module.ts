import { Module } from '@nestjs/common';
import { StockMovementRepositoryModule } from '@modules/supply/inventory/infrastructure/persistence/prisma/repositories/stock-movement/stock-movement.repository.module';
import { StockQuantityChangedListener } from './listeners';

export const INVENTORY_LISTENERS = [StockQuantityChangedListener];

@Module({
  imports: [StockMovementRepositoryModule],
  providers: [...INVENTORY_LISTENERS],
})
export class InventoryEventModule {}
