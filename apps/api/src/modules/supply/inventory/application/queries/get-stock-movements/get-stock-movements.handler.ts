import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
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

    const { policy } = this.policyFactory.clinic(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.actorCanManageTargetClinic(clinicId)
    ) {
      throw new ForbiddenException(
        'Bu kliniğin stok hareketlerine erişim yetkiniz yok.'
      );
    }

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

    return { data: result };
  }
}
