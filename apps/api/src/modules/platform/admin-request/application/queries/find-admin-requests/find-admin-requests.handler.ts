import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAdminRequestsQuery } from './find-admin-requests.query';
import { FindAdminRequestsResponse } from './find-admin-requests.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  ADMIN_REQUEST_QUERY_REPOSITORY,
  IAdminRequestQueryRepository,
} from '@modules/platform/admin-request/domain/repositories/admin-request/admin-request.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(FindAdminRequestsQuery)
export class FindAdminRequestsHandler
  implements IQueryHandler<FindAdminRequestsQuery, FindAdminRequestsResponse>
{
  constructor(
    @Inject(ADMIN_REQUEST_QUERY_REPOSITORY)
    private readonly adminRequestRepo: IAdminRequestQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: FindAdminRequestsQuery
  ): Promise<FindAdminRequestsResponse> {
    const { filter, pagination, ctx } = query.payload;

    // Talep listesi organizasyon sınırı tanımaz (silme talepleri dâhil) —
    // yalnız sistem yöneticisi görebilir.
    const { evaluator, policy } = this.policyFactory.entity(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check(
        (p) => p.isSystemAdmin(),
        'Yönetici taleplerini yalnız sistem yöneticisi listeleyebilir.'
      )
      .orThrow('admin-request.list');

    const { total, items } = await this.adminRequestRepo.findMany({
      type: filter.type,
      status: filter.status,
      pagination,
    });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions: policy.getSerializationOptions(),
      },
    };
  }
}
