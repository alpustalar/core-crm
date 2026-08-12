import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindProductsQuery } from './find-products.query';
import { FindProductsResponse } from './find-products.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product/product.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

@QueryHandler(FindProductsQuery)
export class FindProductsHandler
  implements IQueryHandler<FindProductsQuery, FindProductsResponse>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productRepo: IProductQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver
  ) {}

  async execute(query: FindProductsQuery): Promise<FindProductsResponse> {
    const { pagination, ctx } = query.payload;

    const organizationId = await this.tenantScopeResolver.resolve(
      query.payload
    );

    const result = await this.productRepo.findMany(organizationId, pagination);

    const clinicId = result.items[0].clinicId;

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
        serializationOptions: this.policyFactory
          .clinic(ctx.actor, ctx.source)
          .policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}
