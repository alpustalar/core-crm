import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProductStockQuery } from './get-product-stock.query';
import { GetProductStockResponse } from './get-product-stock.response';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';

@QueryHandler(GetProductStockQuery)
export class GetProductStockHandler
  implements IQueryHandler<GetProductStockQuery, GetProductStockResponse>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepo: IProductQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetProductStockQuery): Promise<GetProductStockResponse> {
    const { clinicId, ctx } = query;
    const { actor } = ctx;

    this.policyFactory
      .clinic(actor)
      .evaluator.check(
        (p) => p.actorCanAccessTargetClinic(clinicId),
        'Bu kliniğin stok bilgisine erişim yetkiniz yok.'
      )
      .orThrow();

    const levels = await this.productQueryRepo.getStockLevels(clinicId);
    return { data: levels };
  }
}
