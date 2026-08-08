import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetLowStockAlertsQuery } from './get-low-stock-alerts.query';
import { GetLowStockAlertsResponse } from './get-low-stock-alerts.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product/product.query.repository';

@QueryHandler(GetLowStockAlertsQuery)
export class GetLowStockAlertsHandler
  implements IQueryHandler<GetLowStockAlertsQuery, GetLowStockAlertsResponse>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productRepo: IProductQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetLowStockAlertsQuery
  ): Promise<GetLowStockAlertsResponse> {
    const { clinicId, ctx } = query;

    const alerts = await this.productRepo.getLowStockAlerts(clinicId);
    return { data: alerts };
  }
}
