import { Module } from '@nestjs/common';
import { ExternalWorkOrderCommandRepository } from './external-work-order/external-work-order.command.repository';
import { ExternalWorkOrderQueryRepository } from './external-work-order/external-work-order.query.repository';
import { EXTERNAL_WORK_ORDER_QUERY_REPOSITORY } from '@modules/supply/work-order/domain/repositories/external-work/external-work.query.repository';
import { EXTERNAL_WORK_ORDER_COMMAND_REPOSITORY } from '@modules/supply/work-order/domain/repositories/external-work/external-work-order.command.repository';

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
export class WorkOrderRepositoriesModule {}
