import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPurchaseRequestsQuery } from './get-purchase-requests.query';
import { GetPurchaseRequestsResponse } from './get-purchase-requests.response';
import {
  IPurchaseRequestQueryRepository,
  PURCHASE_REQUEST_QUERY_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetPurchaseRequestsQuery)
export class GetPurchaseRequestsHandler
  implements IQueryHandler<GetPurchaseRequestsQuery, GetPurchaseRequestsResponse>
{
  constructor(
    @Inject(PURCHASE_REQUEST_QUERY_REPOSITORY)
    private readonly prQueryRepo: IPurchaseRequestQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetPurchaseRequestsQuery
  ): Promise<GetPurchaseRequestsResponse> {
    const { filter, pagination, ctx } = query.payload;
    const clinicId = ctx.actor.clinicId ?? '';

    const { evaluator, policy } = this.policyFactory.purchasing(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check((p) => p.canAccessClinicPurchasing(clinicId))
      .orThrow('purchase-request.list');

    const result = await this.prQueryRepo.findByClinic({
      clinicId,
      status: filter.status,
      pagination,
    });

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
        serializationOptions: policy.getSerializationOptions({ clinicId: clinicId }),
      },
    };
  }
}
