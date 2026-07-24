import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindAdminRequestsResponse } from './find-admin-requests.response';
import { FindAdminRequests, Pagination } from '@shared';

export class FindAdminRequestsQuery implements IQuery {
  readonly __responseType!: FindAdminRequestsResponse;

  constructor(
    public readonly payload: {
      filter: FindAdminRequests;
      pagination: Pagination;
      ctx: IGetContext;
    }
  ) {}
}
