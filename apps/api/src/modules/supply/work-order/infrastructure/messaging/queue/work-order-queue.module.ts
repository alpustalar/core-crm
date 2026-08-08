import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { WorkOrderOverdueSchedulerProducer } from './producers/work-order-overdue-scheduler.producer';
import { WorkOrderOverdueProcessor } from './processors/work-order-overdue.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.WORK_ORDER })],
  providers: [WorkOrderOverdueSchedulerProducer, WorkOrderOverdueProcessor],
})
export class WorkOrderQueueModule {}
