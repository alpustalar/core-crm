import { Pagination } from '@shared';
import { Supplier } from '../entities/supplier.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const SUPPLIER_COMMAND_REPOSITORY = Symbol('ISupplierCommandRepository');
export const SUPPLIER_QUERY_REPOSITORY = Symbol('ISupplierQueryRepository');

export interface ISupplierCommandRepository
  extends IBaseCommandRepository<Supplier> {}

export interface ISupplierQueryRepository {
  findById(id: string): Promise<Supplier | null>;
  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: Supplier[]; total: number }>;
}
