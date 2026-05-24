import { Module } from '@nestjs/common';
import { PosCommandModule } from './application/commands/command.module';
import { PosQueryModule } from './application/queries/query.module';
import { PaxModule } from '@modules/pos/infrastructure/providers/pax/pax.module';
import { PosQueueModule } from './infrastructure/queue/pos-queue.module';
import { PosPresentationModule } from './presentation/pos-presentation.module';

@Module({
  imports: [
    PosCommandModule,
    PosQueryModule,
    PosPresentationModule,
    PaxModule,
    PosQueueModule,
  ],
})
export class PosModule {}
