import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkOrderRepositoryModule } from '@modules/supply/work-order/infrastructure/persistence/prisma/repositories/work-order.repository.module';
import { CreateExternalWorkOrderHandler } from './create-external-work-order/create-external-work-order.handler';
import { SendWorkOrderHandler } from './send-work-order/send-work-order.handler';
import { UpdateWorkOrderProgressHandler } from './update-work-order-progress/update-work-order-progress.handler';
import { ReceiveWorkOrderHandler } from './receive-work-order/receive-work-order.handler';
import { FitWorkOrderHandler } from './fit-work-order/fit-work-order.handler';
import { CancelWorkOrderHandler } from './cancel-work-order/cancel-work-order.handler';
import { OpenRemakeWorkOrderHandler } from './open-remake-work-order/open-remake-work-order.handler';
import { ScanOverdueWorkOrdersHandler } from './scan-overdue-work-orders/scan-overdue-work-orders.handler';

export const WORK_ORDER_COMMAND_HANDLERS = [
  CreateExternalWorkOrderHandler,
  SendWorkOrderHandler,
  UpdateWorkOrderProgressHandler,
  ReceiveWorkOrderHandler,
  FitWorkOrderHandler,
  CancelWorkOrderHandler,
  OpenRemakeWorkOrderHandler,
  ScanOverdueWorkOrdersHandler,
];

@Module({
  imports: [CqrsModule, WorkOrderRepositoryModule],
  providers: WORK_ORDER_COMMAND_HANDLERS,
  exports: WORK_ORDER_COMMAND_HANDLERS,
})
export class WorkOrderCommandModule {}
