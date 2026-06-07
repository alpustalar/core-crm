import { Module } from '@nestjs/common';
import { PhysicalPosModule } from './physical/physical.module';
import { VirtualPosModule } from './virtual/virtual.module';

@Module({
  imports: [PhysicalPosModule, VirtualPosModule],
})
export class PosModule {}
