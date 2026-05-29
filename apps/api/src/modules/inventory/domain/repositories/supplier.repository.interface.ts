import { Pagination } from '@shared';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierProps } from '../types/create-supplier.props';
import { UpdateSupplierProps } from '../types/update-supplier.props';

export const SUPPLIER_COMMAND_REPOSITORY = Symbol('ISupplierCommandRepository');
export const SUPPLIER_QUERY_REPOSITORY = Symbol('ISupplierQueryRepository');

export interface ISupplierCommandRepository {
  create(props: CreateSupplierProps): Promise<Supplier>;
  save(supplier: Supplier): Promise<Supplier>;
}

export interface ISupplierQueryRepository {
  findById(id: string): Promise<Supplier | null>;
  findMany(organizationId: string, pagination: Pagination): Promise<{ items: Supplier[]; total: number }>;
}
