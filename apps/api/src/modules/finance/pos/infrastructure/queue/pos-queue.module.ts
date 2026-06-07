import { QUEUES } from '@common/constants';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PosReconcileProcessor } from './processors/pos-reconcile.processor';
import { PosReconcileProducer } from './producers/pos-reconcile.producer';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.POS }),
  ],
  providers: [PosReconcileProducer, PosReconcileProcessor],
})
export class PosQueueModule {}
