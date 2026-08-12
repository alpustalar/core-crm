import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPurchaseOrdersQuery } from './get-purchase-orders.query';
import { GetPurchaseOrdersResponse } from './get-purchase-orders.response';
import {
  IPurchaseOrderQueryRepository,
  PURCHASE_ORDER_QUERY_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetPurchaseOrdersQuery)
export class GetPurchaseOrdersHandler
  implements IQueryHandler<GetPurchaseOrdersQuery, GetPurchaseOrdersResponse>
{
  constructor(
    @Inject(PURCHASE_ORDER_QUERY_REPOSITORY)
    private readonly poQueryRepo: IPurchaseOrderQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetPurchaseOrdersQuery
  ): Promise<GetPurchaseOrdersResponse> {
    const { filter, pagination, ctx } = query.payload;
    const clinicId = ctx.actor.clinicId ?? '';

    const { evaluator, policy } = this.policyFactory.purchasing(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check((p) => p.canAccessClinicPurchasing(clinicId))
      .orThrow('purchase-order.list');

    const result = await this.poQueryRepo.findByClinic({
      clinicId,
      status: filter.status,
      supplierId: filter.supplierId,
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
