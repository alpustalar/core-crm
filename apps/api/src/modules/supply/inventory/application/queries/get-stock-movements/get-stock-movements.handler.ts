import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetStockMovementsQuery } from './get-stock-movements.query';
import { GetStockMovementsResponse } from './get-stock-movements.response';
import {
  IStockMovementQueryRepository,
  STOCK_MOVEMENT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetStockMovementsQuery)
export class GetStockMovementsHandler
  implements IQueryHandler<GetStockMovementsQuery, GetStockMovementsResponse>
{
  constructor(
    @Inject(STOCK_MOVEMENT_QUERY_REPOSITORY)
    private readonly stockMovementQueryRepo: IStockMovementQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetStockMovementsQuery
  ): Promise<GetStockMovementsResponse> {
    const { clinicId, dto, ctx, pagination } = query;
    const { actor } = ctx;

    this.policyFactory
      .clinic(actor)
      .evaluator.check(
        (p) => p.actorCanAccessTargetClinic(clinicId),
        'Bu kliniğin stok hareketlerine erişim yetkiniz yok.'
      )
      .orThrow();

    // TODO: hascapability guard gelecek

    const result = dto.productId
      ? await this.stockMovementQueryRepo.findManyByProduct(
          dto.productId,
          clinicId,
          pagination
        )
      : await this.stockMovementQueryRepo.findManyByClinic(
          clinicId,
          pagination
        );

    return {
      data: result.items.map((stockMovement) => stockMovement.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
      },
    };
  }
}
