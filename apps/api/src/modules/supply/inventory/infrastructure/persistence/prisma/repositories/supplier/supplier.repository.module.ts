import { Module } from '@nestjs/common';
import { SupplierCommandRepository } from './supplier.command.repository';
import { SupplierQueryRepository } from './supplier.query.repository';
import { SUPPLIER_COMMAND_REPOSITORY } from '@modules/supply/inventory/domain/repositories/supplier/supplier.command.repository';
import { SUPPLIER_QUERY_REPOSITORY } from '@modules/supply/inventory/domain/repositories/supplier/supplier.query.repository';

@Module({
  providers: [
    {
      provide: SUPPLIER_COMMAND_REPOSITORY,
      useClass: SupplierCommandRepository,
    },
    { provide: SUPPLIER_QUERY_REPOSITORY, useClass: SupplierQueryRepository },
  ],
  exports: [SUPPLIER_COMMAND_REPOSITORY, SUPPLIER_QUERY_REPOSITORY],
})
export class SupplierRepositoryModule {}
