import { Pagination } from '@shared';
import { StockMovement } from '../entities/stock-movement.entity';
import { CreateStockMovementProps } from '../types/create-stock-movement.props';

export const STOCK_MOVEMENT_COMMAND_REPOSITORY = Symbol('IStockMovementCommandRepository');
export const STOCK_MOVEMENT_QUERY_REPOSITORY = Symbol('IStockMovementQueryRepository');

export interface IStockMovementCommandRepository {
  create(props: CreateStockMovementProps): Promise<StockMovement>;
}

export interface IStockMovementQueryRepository {
  findManyByClinic(clinicId: string, pagination: Pagination): Promise<{ items: StockMovement[]; total: number }>;
  findManyByProduct(productId: string, clinicId: string, pagination: Pagination): Promise<{ items: StockMovement[]; total: number }>;
}
