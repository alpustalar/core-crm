import { Pagination } from '@shared';
import { StockMovement } from '../entities/stock-movement.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const STOCK_MOVEMENT_COMMAND_REPOSITORY = Symbol(
  'IStockMovementCommandRepository'
);
export const STOCK_MOVEMENT_QUERY_REPOSITORY = Symbol(
  'IStockMovementQueryRepository'
);

export interface IStockMovementCommandRepository
  extends IBaseCommandRepository<StockMovement> {}

export interface IStockMovementQueryRepository {
  findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: StockMovement[]; total: number }>;
  findManyByProduct(
    productId: string,
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: StockMovement[]; total: number }>;
}
