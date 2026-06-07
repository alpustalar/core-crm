import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindAdminRequestsDto } from '@shared/modules/admin-request/dto/queries';
import { FindAdminRequestsResponse } from './find-admin-requests.response';
import { Pagination } from '@shared';

export class FindAdminRequestsQuery implements IQuery {
  readonly __responseType!: FindAdminRequestsResponse;

  constructor(
    public readonly dto: FindAdminRequestsDto,
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext
  ) {}
}
