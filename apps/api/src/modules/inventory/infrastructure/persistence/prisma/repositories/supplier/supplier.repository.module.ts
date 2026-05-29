import { Module } from '@nestjs/common';
import {
  SUPPLIER_COMMAND_REPOSITORY,
  SUPPLIER_QUERY_REPOSITORY,
} from '@modules/inventory/domain/repositories/supplier.repository.interface';
import { SupplierCommandRepository } from './supplier.command.repository';
import { SupplierQueryRepository } from './supplier.query.repository';

@Module({
  providers: [
    { provide: SUPPLIER_COMMAND_REPOSITORY, useClass: SupplierCommandRepository },
    { provide: SUPPLIER_QUERY_REPOSITORY, useClass: SupplierQueryRepository },
  ],
  exports: [SUPPLIER_COMMAND_REPOSITORY, SUPPLIER_QUERY_REPOSITORY],
})
export class SupplierRepositoryModule {}
