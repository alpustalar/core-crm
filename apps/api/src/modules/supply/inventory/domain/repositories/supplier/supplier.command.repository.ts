import { Supplier } from '@modules/supply/inventory/domain/entities/supplier.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const SUPPLIER_COMMAND_REPOSITORY = Symbol('ISupplierCommandRepository');

export type ISupplierCommandRepository = IBaseCommandRepository<Supplier>;
