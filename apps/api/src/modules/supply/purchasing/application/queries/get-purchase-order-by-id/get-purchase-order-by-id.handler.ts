import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPurchaseOrderByIdQuery } from './get-purchase-order-by-id.query';
import { GetPurchaseOrderByIdResponse } from './get-purchase-order-by-id.response';
import {
  IPurchaseOrderQueryRepository,
  PURCHASE_ORDER_QUERY_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetPurchaseOrderByIdQuery)
export class GetPurchaseOrderByIdHandler
  implements
    IQueryHandler<GetPurchaseOrderByIdQuery, GetPurchaseOrderByIdResponse>
{
  constructor(
    @Inject(PURCHASE_ORDER_QUERY_REPOSITORY)
    private readonly poQueryRepo: IPurchaseOrderQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetPurchaseOrderByIdQuery
  ): Promise<GetPurchaseOrderByIdResponse> {
    const { orderId, ctx } = query;
    const data = await this.poQueryRepo.findById(orderId);

    const { evaluator, policy } = this.policyFactory.purchasing(
      ctx.actor,
      ctx.source
    );

    if (!data) {
      return {
        data: null,
        meta: {
          serializationOptions: policy.getSerializationOptions({
            clinicId: ctx.actor.clinicId ?? '',
          }),
        },
      };
    }

    evaluator
      .check((p) => p.canAccessClinicPurchasing(data.clinicId))
      .orThrow('purchase-order.detail');

    return {
      data,
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: data.clinicId,
        }),
      },
    };
  }
}
