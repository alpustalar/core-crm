import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPurchaseOrderMatchSummaryQuery } from './get-purchase-order-match-summary.query';
import { GetPurchaseOrderMatchSummaryResponse } from './get-purchase-order-match-summary.response';
import {
  IPurchaseOrderQueryRepository,
  PURCHASE_ORDER_QUERY_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { buildMatchSummary } from '@modules/supply/purchasing/domain/rules/purchase-order-billing.rules';

/**
 * Entity hidrate edilmez: hesap saf `purchase-order-billing.rules` fonksiyonlarıyla
 * okuma modeli üzerinden yapılır (CLAUDE.md — query handler entity kurmaz).
 */
@QueryHandler(GetPurchaseOrderMatchSummaryQuery)
export class GetPurchaseOrderMatchSummaryHandler implements IQueryHandler<
  GetPurchaseOrderMatchSummaryQuery,
  GetPurchaseOrderMatchSummaryResponse
> {
  constructor(
    @Inject(PURCHASE_ORDER_QUERY_REPOSITORY)
    private readonly poQueryRepo: IPurchaseOrderQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetPurchaseOrderMatchSummaryQuery
  ): Promise<GetPurchaseOrderMatchSummaryResponse> {
    const order = await this.poQueryRepo.findById(query.orderId);
    if (!order) return { data: null };

    this.policyFactory
      .purchasing(query.ctx.actor, query.ctx.source)
      .evaluator.check((p) => p.canAccessClinicPurchasing(order.clinicId))
      .orThrow('purchase-order.match-summary');

    return {
      data: buildMatchSummary({
        grandTotal: order.grandTotal,
        invoicedTotal: order.invoicedTotal,
        billingStatus: order.billingStatus,
        lines: order.items.map((item) => ({
          quantityReceived: item.quantityReceived,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
        })),
      }),
    };
  }
}
