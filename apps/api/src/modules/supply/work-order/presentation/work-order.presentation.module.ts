import { Module } from '@nestjs/common';
import { WorkOrderCommandModule } from '@modules/supply/work-order/application/commands/command.module';
import { WorkOrderQueryModule } from '@modules/supply/work-order/application/queries/query.module';
import { WorkOrderCommandController } from './controllers/work-order/work-order-command.controller';
import { WorkOrderQueryController } from './controllers/work-order/work-order-query.controller';

@Module({
  imports: [WorkOrderCommandModule, WorkOrderQueryModule],
  controllers: [WorkOrderCommandController, WorkOrderQueryController],
})
export class WorkOrderPresentationModule {}
