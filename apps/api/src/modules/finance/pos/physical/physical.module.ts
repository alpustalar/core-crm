import { Module } from '@nestjs/common';
import { PhysicalPosCommandModule } from './application/commands/command.module';
import { PhysicalPosQueryModule } from './application/queries/query.module';
import { PosQueueModule } from '@modules/finance/pos/physical/infrastructure/messaging/queue/pos-queue.module';
import { PhysicalPosPresentationModule } from './presentation/presentation.module';
import { PosTransactionEventModule } from '@modules/finance/pos/physical/infrastructure/messaging/events/pos-transaction-event.module';
import { PosInfrastructureModule } from '@src/infrastructure/payment/pos/pos.infrastructure.module';

@Module({
  imports: [
    PosInfrastructureModule,
    PhysicalPosCommandModule,
    PhysicalPosQueryModule,
    PosQueueModule,
    PhysicalPosPresentationModule,
    PosTransactionEventModule,
  ],
})
export class PhysicalPosModule {}
