import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAdminRequestsQuery } from './find-admin-requests.query';
import { FindAdminRequestsResponse } from './find-admin-requests.response';
import {
  ADMIN_REQUEST_QUERY_REPOSITORY,
  IAdminRequestQueryRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request.repository.interface';
import { AdminRequestStatus, AdminRequestType } from '@prisma/client';
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
    const { dto, pagination } = query;

    const result = await this.adminRequestQueryRepo.findMany({
      type: dto.type as AdminRequestType | undefined,
      status: dto.status as AdminRequestStatus | undefined,
      pagination,
    });

    return {
      data: result,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
