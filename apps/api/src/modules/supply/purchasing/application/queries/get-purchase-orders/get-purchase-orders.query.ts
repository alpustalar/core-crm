import { IQuery } from '@nestjs/cqrs';
import { GetPurchaseOrders } from '@shared/modules/purchasing/types/queries';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetPurchaseOrdersResponse } from './get-purchase-orders.response';

export class GetPurchaseOrdersQuery implements IQuery {
  readonly __responseType!: GetPurchaseOrdersResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetPurchaseOrders;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
