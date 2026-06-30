import { Pagination } from '@shared';
import { Supplier } from '../entities/supplier.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const SUPPLIER_COMMAND_REPOSITORY = Symbol('ISupplierCommandRepository');
export const SUPPLIER_QUERY_REPOSITORY = Symbol('ISupplierQueryRepository');

export type ISupplierCommandRepository = IBaseCommandRepository<Supplier>;

export interface ISupplierQueryRepository {
  findById(id: string): Promise<Supplier | null>;
  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: Supplier[]; total: number }>;
}
