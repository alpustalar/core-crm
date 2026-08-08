import { Module } from '@nestjs/common';
import { WorkOrderRepositoriesModule } from '@modules/supply/work-order/infrastructure/persistence/prisma/repositories/repositories.module';
import { GetWorkOrdersHandler } from './get-work-orders/get-work-orders.handler';
import { GetWorkOrderByIdHandler } from './get-work-order-by-id/get-work-order-by-id.handler';
import { GetWorkOrderSummaryHandler } from './get-work-order-summary/get-work-order-summary.handler';

export const WORK_ORDER_QUERY_HANDLERS = [
  GetWorkOrdersHandler,
  GetWorkOrderByIdHandler,
  GetWorkOrderSummaryHandler,
];

@Module({
  imports: [WorkOrderRepositoriesModule],
  providers: WORK_ORDER_QUERY_HANDLERS,
})
export class WorkOrderQueryModule {}
