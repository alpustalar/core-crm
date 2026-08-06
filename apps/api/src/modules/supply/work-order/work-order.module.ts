import { Module } from '@nestjs/common';
import { WorkOrderPresentationModule } from './presentation/work-order.presentation.module';
import { WorkOrderCommandModule } from './application/commands/command.module';
import { WorkOrderQueryModule } from './application/queries/query.module';
import { WorkOrderQueueModule } from './infrastructure/queue/work-order-queue.module';

@Module({
  imports: [
    WorkOrderPresentationModule,
    WorkOrderCommandModule,
    WorkOrderQueryModule,
    WorkOrderQueueModule,
  ],
  exports: [WorkOrderCommandModule, WorkOrderQueryModule],
})
export class WorkOrderModule {}
