import { Module } from '@nestjs/common';
import { InventoryPresentationModule } from './presentation/presentation.module';

@Module({ imports: [InventoryPresentationModule] })
export class InventoryModule {}
