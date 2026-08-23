import { Module } from '@nestjs/common';
import { InventoryRepositoriesModule } from '@modules/supply/inventory/infrastructure/persistence/prisma/repositories/repositories.module';
import { InventoryEventModule } from '@modules/supply/inventory/infrastructure/messaging/events/inventory-event.module';

const InventoryInfrastructureModules = [
  InventoryRepositoriesModule,
  InventoryEventModule,
];

@Module({
  imports: [...InventoryInfrastructureModules],
  exports: [...InventoryInfrastructureModules],
})
export class InventoryInfrastructureModule {}
