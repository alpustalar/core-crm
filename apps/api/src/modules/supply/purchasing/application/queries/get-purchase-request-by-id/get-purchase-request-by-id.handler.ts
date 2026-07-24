import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPurchaseRequestByIdQuery } from './get-purchase-request-by-id.query';
import { GetPurchaseRequestByIdResponse } from './get-purchase-request-by-id.response';
import {
  IPurchaseRequestQueryRepository,
  PURCHASE_REQUEST_QUERY_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetPurchaseRequestByIdQuery)
export class GetPurchaseRequestByIdHandler
  implements
    IQueryHandler<GetPurchaseRequestByIdQuery, GetPurchaseRequestByIdResponse>
{
  constructor(
    @Inject(PURCHASE_REQUEST_QUERY_REPOSITORY)
    private readonly prQueryRepo: IPurchaseRequestQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetPurchaseRequestByIdQuery
  ): Promise<GetPurchaseRequestByIdResponse> {
    const { requestId, ctx } = query;
    const data = await this.prQueryRepo.findById(requestId);

    if (!data) return { data: null };

    this.policyFactory
      .purchasing(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicPurchasing(data.clinicId))
      .orThrow('purchase-request.detail');

    return { data };
  }
}
