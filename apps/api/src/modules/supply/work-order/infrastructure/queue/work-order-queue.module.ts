import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { QUEUES } from '@common/constants';
import { WorkOrderCommandModule } from '@modules/supply/work-order/application/commands/command.module';
import { WorkOrderOverdueSchedulerProducer } from './producers/work-order-overdue-scheduler.producer';
import { WorkOrderOverdueProcessor } from './processors/work-order-overdue.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.WORK_ORDER }),
    CqrsModule,
    WorkOrderCommandModule,
  ],
  providers: [WorkOrderOverdueSchedulerProducer, WorkOrderOverdueProcessor],
})
export class WorkOrderQueueModule {}
