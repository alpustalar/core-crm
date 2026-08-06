import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkOrderRepositoryModule } from '@modules/supply/work-order/infrastructure/persistence/prisma/repositories/work-order.repository.module';
import { GetWorkOrdersHandler } from './get-work-orders/get-work-orders.handler';
import { GetWorkOrderByIdHandler } from './get-work-order-by-id/get-work-order-by-id.handler';
import { GetWorkOrderSummaryHandler } from './get-work-order-summary/get-work-order-summary.handler';

export const WORK_ORDER_QUERY_HANDLERS = [
  GetWorkOrdersHandler,
  GetWorkOrderByIdHandler,
  GetWorkOrderSummaryHandler,
];

@Module({
  imports: [CqrsModule, WorkOrderRepositoryModule],
  providers: WORK_ORDER_QUERY_HANDLERS,
  exports: WORK_ORDER_QUERY_HANDLERS,
})
export class WorkOrderQueryModule {}
