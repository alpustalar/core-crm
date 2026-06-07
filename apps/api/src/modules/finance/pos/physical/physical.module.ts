import { Module } from '@nestjs/common';
import { PosCommandModule } from './application/commands/command.module';
import { PosQueryModule } from './application/queries/query.module';
import { PosQueueModule } from './infrastructure/queue/pos-queue.module';
import { PosPresentationModule } from './presentation/pos-presentation.module';

@Module({
  imports: [PosCommandModule, PosQueryModule, PosQueueModule, PosPresentationModule],
  exports: [PosCommandModule, PosQueryModule],
})
export class PhysicalPosModule {}
