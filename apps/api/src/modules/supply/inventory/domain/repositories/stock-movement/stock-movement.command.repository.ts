import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';

export const STOCK_MOVEMENT_COMMAND_REPOSITORY = Symbol(
  'IStockMovementCommandRepository'
);
export interface IStockMovementCommandRepository
  extends IBaseCommandRepository<StockMovement> {}