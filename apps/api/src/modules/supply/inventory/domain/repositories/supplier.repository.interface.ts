import { Pagination, Supplier as ISupplier } from '@shared';
import { Supplier } from '../entities/supplier.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const SUPPLIER_COMMAND_REPOSITORY = Symbol('ISupplierCommandRepository');
export const SUPPLIER_QUERY_REPOSITORY = Symbol('ISupplierQueryRepository');

export type ISupplierCommandRepository = IBaseCommandRepository<Supplier>;

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
