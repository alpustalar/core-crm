import { Module } from '@nestjs/common';
import { InventoryRepositoriesModule } from '@modules/supply/inventory/infrastructure/persistence/prisma/repositories/repositories.module';

const InventoryInfrastructureModules = [InventoryRepositoriesModule];

@Module({
  imports: [...InventoryInfrastructureModules],
  exports: [...InventoryInfrastructureModules],
})
export class InventoryInfrastructureModule {}