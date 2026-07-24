import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PurchasingRepositoryModule } from '@modules/supply/purchasing/infrastructure/persistence/prisma/repositories/purchasing.repository.module';
import { GetPurchaseRequestsHandler } from './get-purchase-requests/get-purchase-requests.handler';
import { GetPurchaseRequestByIdHandler } from './get-purchase-request-by-id/get-purchase-request-by-id.handler';
import { GetPurchaseOrdersHandler } from './get-purchase-orders/get-purchase-orders.handler';
import { GetPurchaseOrderByIdHandler } from './get-purchase-order-by-id/get-purchase-order-by-id.handler';

export const PURCHASING_QUERY_HANDLERS = [
  GetPurchaseRequestsHandler,
  GetPurchaseRequestByIdHandler,
  GetPurchaseOrdersHandler,
  GetPurchaseOrderByIdHandler,
];

@Module({
  imports: [CqrsModule, PurchasingRepositoryModule],
  providers: PURCHASING_QUERY_HANDLERS,
  exports: PURCHASING_QUERY_HANDLERS,
})
export class PurchasingQueryModule {}
