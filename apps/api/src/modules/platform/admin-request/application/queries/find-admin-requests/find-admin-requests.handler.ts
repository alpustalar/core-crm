import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAdminRequestsQuery } from './find-admin-requests.query';
import { FindAdminRequestsResponse } from './find-admin-requests.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  ADMIN_REQUEST_QUERY_REPOSITORY,
  IAdminRequestQueryRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request/admin-request.query.repository';

@QueryHandler(FindAdminRequestsQuery)
export class FindAdminRequestsHandler
  implements IQueryHandler<FindAdminRequestsQuery, FindAdminRequestsResponse>
{
  constructor(
    @Inject(ADMIN_REQUEST_QUERY_REPOSITORY)
    private readonly adminRequestRepo: IAdminRequestQueryRepository
  ) {}

  async execute(
    query: FindAdminRequestsQuery
  ): Promise<FindAdminRequestsResponse> {
    const { filter, pagination } = query.payload;

    const { total, items } = await this.adminRequestRepo.findMany({
      type: filter.type,
      status: filter.status,
      pagination,
    });

    return {
      data: items,
      meta: { pagination: buildPaginationMeta(pagination, total) },
    };
  }
}
