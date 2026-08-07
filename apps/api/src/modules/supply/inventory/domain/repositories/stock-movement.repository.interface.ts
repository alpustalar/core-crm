import { Pagination, StockMovement as IStockMovement } from '@shared';
import { StockMovement } from '../entities/stock-movement.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const STOCK_MOVEMENT_COMMAND_REPOSITORY = Symbol(
  'IStockMovementCommandRepository'
);
export const STOCK_MOVEMENT_QUERY_REPOSITORY = Symbol(
  'IStockMovementQueryRepository'
);

export interface IStockMovementCommandRepository extends IBaseCommandRepository<StockMovement> {}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IStockMovementQueryRepository {
  findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: IStockMovement[]; total: number }>;
  findManyByProduct(
    productId: string,
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: IStockMovement[]; total: number }>;
}
