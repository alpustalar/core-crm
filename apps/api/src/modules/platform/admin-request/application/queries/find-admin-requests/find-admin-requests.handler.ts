import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAdminRequestsQuery } from './find-admin-requests.query';
import { FindAdminRequestsResponse } from './find-admin-requests.response';
import {
  ADMIN_REQUEST_QUERY_REPOSITORY,
  IAdminRequestQueryRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(FindAdminRequestsQuery)
export class FindAdminRequestsHandler
  implements IQueryHandler<FindAdminRequestsQuery, FindAdminRequestsResponse>
{
  constructor(
    @Inject(ADMIN_REQUEST_QUERY_REPOSITORY)
    private readonly adminRequestQueryRepo: IAdminRequestQueryRepository
  ) {}

  async execute(
    query: FindAdminRequestsQuery
  ): Promise<FindAdminRequestsResponse> {
    const { filter, pagination } = query.payload;

    const { total, items } = await this.adminRequestQueryRepo.findMany({
      type: filter.type,
      status: filter.status,
      pagination,
    });

    return {
      data: items.map((item) => item.toPersistence()),
      meta: { pagination: buildPaginationMeta(pagination, total) },
    };
  }
}
