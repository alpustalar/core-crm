import { Module } from '@nestjs/common';
import { PhysicalPosCommandModule } from './application/commands/command.module';
import { PhysicalPosQueryModule } from './application/queries/query.module';
import { PosQueueModule } from './infrastructure/queue/pos-queue.module';
import { PosPresentationModule } from './presentation/pos-presentation.module';
import { PosTransactionEventModule } from './infrastructure/events/pos-transaction-event.module';
import { PosInfrastructureModule } from '@src/infrastructure/payment/pos/pos.infrastructure.module';

@Module({
  imports: [
    PosInfrastructureModule,
    PhysicalPosCommandModule,
    PhysicalPosQueryModule,
    PosQueueModule,
    PosPresentationModule,
    PosTransactionEventModule,
  ],
  exports: [PhysicalPosCommandModule, PhysicalPosQueryModule],
})
export class PhysicalPosModule {}
