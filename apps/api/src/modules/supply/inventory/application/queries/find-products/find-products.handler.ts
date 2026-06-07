import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
import { FindProductsQuery } from './find-products.query';
import { FindProductsResponse } from './find-products.response';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';

@QueryHandler(FindProductsQuery)
export class FindProductsHandler
  implements IQueryHandler<FindProductsQuery, FindProductsResponse>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepo: IProductQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: FindProductsQuery): Promise<FindProductsResponse> {
    const { pagination, ctx } = query;
    const { actor } = ctx;

    const { policy } = this.policyFactory.organization(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.isOwnOrganization(actor.organizationId)
    ) {
      throw new ForbiddenException('Ürün listeleme yetkiniz yok.');
    }

    const result = await this.productQueryRepo.findMany(
      actor.organizationId!,
      pagination
    );

    return { data: result };
  }
}
