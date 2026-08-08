import { Pagination, StockMovement as IStockMovement } from '@shared';

export const STOCK_MOVEMENT_QUERY_REPOSITORY = Symbol(
  'IStockMovementQueryRepository'
);

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
