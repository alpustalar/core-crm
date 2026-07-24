import { IQuery } from '@nestjs/cqrs';
import { GetPurchaseRequests } from '@shared/modules/purchasing/types/queries';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetPurchaseRequestsResponse } from './get-purchase-requests.response';

export class GetPurchaseRequestsQuery implements IQuery {
  readonly __responseType!: GetPurchaseRequestsResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetPurchaseRequests;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
