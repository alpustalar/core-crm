import { Pagination, Supplier as ISupplier } from '@shared';

export const SUPPLIER_QUERY_REPOSITORY = Symbol('ISupplierQueryRepository');

/**
 * Okuma tarafı: entity değil, plain model döner.
 * NOT: `findById` hiçbir yerden çağrılmıyordu — kaldırıldı.
 */
export interface ISupplierQueryRepository {
  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: ISupplier[]; total: number }>;
}
