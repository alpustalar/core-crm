import { IQuery } from '@nestjs/cqrs';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetWorkOrders } from '@shared/modules/work-order/types/queries';
import { GetWorkOrdersResponse } from './get-work-orders.response';

export class GetWorkOrdersQuery implements IQuery {
  readonly __responseType!: GetWorkOrdersResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetWorkOrders;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
