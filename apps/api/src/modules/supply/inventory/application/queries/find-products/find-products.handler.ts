import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindProductsQuery } from './find-products.query';
import { FindProductsResponse } from './find-products.response';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(FindProductsQuery)
export class FindProductsHandler
  implements IQueryHandler<FindProductsQuery, FindProductsResponse>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepo: IProductQueryRepository
  ) {}

  async execute(query: FindProductsQuery): Promise<FindProductsResponse> {
    const { pagination, ctx } = query;
    const { actor } = ctx;

    const result = await this.productQueryRepo.findMany(
      actor.organizationId!,
      pagination
    );

    // TODO: hascapability guard gelecek

    return {
      data: result.items.map((item) => item.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
      },
    };
  }
}
