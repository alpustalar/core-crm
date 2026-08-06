import { Module } from '@nestjs/common';
import {
  EXTERNAL_WORK_ORDER_COMMAND_REPOSITORY,
  EXTERNAL_WORK_ORDER_QUERY_REPOSITORY,
} from '@modules/supply/work-order/domain/repositories/external-work-order.repository';
import { ExternalWorkOrderCommandRepository } from './external-work-order.command.repository';
import { ExternalWorkOrderQueryRepository } from './external-work-order.query.repository';

@Module({
  providers: [
    {
      provide: EXTERNAL_WORK_ORDER_COMMAND_REPOSITORY,
      useClass: ExternalWorkOrderCommandRepository,
    },
    {
      provide: EXTERNAL_WORK_ORDER_QUERY_REPOSITORY,
      useClass: ExternalWorkOrderQueryRepository,
    },
  ],
  exports: [
    EXTERNAL_WORK_ORDER_COMMAND_REPOSITORY,
    EXTERNAL_WORK_ORDER_QUERY_REPOSITORY,
  ],
})
export class WorkOrderRepositoryModule {}
