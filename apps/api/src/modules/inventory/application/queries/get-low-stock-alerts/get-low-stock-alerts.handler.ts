import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
import { GetLowStockAlertsQuery } from './get-low-stock-alerts.query';
import { GetLowStockAlertsResponse } from './get-low-stock-alerts.response';
import {
  PRODUCT_QUERY_REPOSITORY,
  IProductQueryRepository,
} from '@modules/inventory/domain/repositories/product.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';

@QueryHandler(GetLowStockAlertsQuery)
export class GetLowStockAlertsHandler implements IQueryHandler<GetLowStockAlertsQuery, GetLowStockAlertsResponse> {
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepo: IProductQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
  ) {}

  async execute(query: GetLowStockAlertsQuery): Promise<GetLowStockAlertsResponse> {
    const { clinicId, ctx } = query;
    const { actor } = ctx;

    const { policy } = this.policyFactory.clinic(actor);
    if (!policy.isSystemAdmin() && !policy.actorCanManageTargetClinic(clinicId)) {
      throw new ForbiddenException('Bu kliniğin stok uyarılarına erişim yetkiniz yok.');
    }

    const alerts = await this.productQueryRepo.getLowStockAlerts(clinicId);
    return { data: alerts };
  }
}
