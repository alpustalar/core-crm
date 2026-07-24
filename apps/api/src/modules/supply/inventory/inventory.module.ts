import { Module } from '@nestjs/common';
import { InventoryCommandModule } from './application/commands/command.module';
import { InventoryQueryModule } from './application/queries/query.module';
import { InventoryPresentationModule } from './presentation/inventory-presentation.module';

@Module({
  imports: [
    InventoryCommandModule,
    InventoryQueryModule,
    InventoryPresentationModule,
  ],
  exports: [InventoryCommandModule, InventoryQueryModule],
})
export class InventoryModule {}
