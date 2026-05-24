import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { QUEUES } from '@common/constants';
import { PosReconcileProducer } from './producers/pos-reconcile.producer';
import { PosReconcileProcessor } from './processors/pos-reconcile.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.POS }),
    CqrsModule,
  ],
  providers: [PosReconcileProducer, PosReconcileProcessor],
})
export class PosQueueModule {}
