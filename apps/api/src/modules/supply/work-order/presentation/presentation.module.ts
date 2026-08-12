import { Module } from '@nestjs/common';
import { WorkOrderCommandController } from '@modules/supply/work-order/presentation/http/controllers/work-order/work-order.command.controller';
import { WorkOrderQueryController } from '@modules/supply/work-order/presentation/http/controllers/work-order/work-order.query.controller';

@Module({ controllers: [WorkOrderCommandController, WorkOrderQueryController] })
export class WorkOrderPresentationModule {}
