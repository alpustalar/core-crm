import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindProductsQuery } from './find-products.query';
import { FindProductsResponse } from './find-products.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product/product.query.repository';

@QueryHandler(FindProductsQuery)
export class FindProductsHandler
  implements IQueryHandler<FindProductsQuery, FindProductsResponse>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productRepo: IProductQueryRepository
  ) {}

  async execute(query: FindProductsQuery): Promise<FindProductsResponse> {
    const { pagination, ctx } = query;
    const { actor } = ctx;

    const result = await this.productRepo.findMany(
      actor.organizationId!,
      pagination
    );

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
      },
    };
  }
}
