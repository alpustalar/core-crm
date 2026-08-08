import { Module } from '@nestjs/common';
import { PhysicalPosCommandModule } from '@modules/finance/pos/physical/application/commands/command.module';
import { PhysicalPosQueryModule } from '@modules/finance/pos/physical/application/queries/query.module';

const ApplicationModules = [PhysicalPosCommandModule, PhysicalPosQueryModule];

@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class PhysicalPosApplicationModule {}
