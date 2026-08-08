import { Module } from '@nestjs/common';
import {
  PURCHASE_REQUEST_COMMAND_REPOSITORY,
  PURCHASE_REQUEST_QUERY_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import {
  PURCHASE_ORDER_COMMAND_REPOSITORY,
  PURCHASE_ORDER_QUERY_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import { PurchaseRequestCommandRepository } from './purchase-request/purchase-request.command.repository';
import { PurchaseRequestQueryRepository } from './purchase-request/purchase-request.query.repository';
import { PurchaseOrderCommandRepository } from './purchase-order/purchase-order.command.repository';
import { PurchaseOrderQueryRepository } from './purchase-order/purchase-order.query.repository';

@Module({
  providers: [
    {
      provide: PURCHASE_REQUEST_COMMAND_REPOSITORY,
      useClass: PurchaseRequestCommandRepository,
    },
    {
      provide: PURCHASE_REQUEST_QUERY_REPOSITORY,
      useClass: PurchaseRequestQueryRepository,
    },
    {
      provide: PURCHASE_ORDER_COMMAND_REPOSITORY,
      useClass: PurchaseOrderCommandRepository,
    },
    {
      provide: PURCHASE_ORDER_QUERY_REPOSITORY,
      useClass: PurchaseOrderQueryRepository,
    },
  ],
  exports: [
    PURCHASE_REQUEST_COMMAND_REPOSITORY,
    PURCHASE_REQUEST_QUERY_REPOSITORY,
    PURCHASE_ORDER_COMMAND_REPOSITORY,
    PURCHASE_ORDER_QUERY_REPOSITORY,
  ],
})
export class PurchasingRepositoriesModule {}
