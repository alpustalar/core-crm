import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetInvoiceByIdHandler } from './get-invoice-by-id/get-invoice-by-id.handler';
import { InvoiceRepositoryModule } from '@modules/finance/invoice/infrastructure/persistence/prisma/repositories/invoice/invoice.repository.module';

const QueryHandlers = [GetInvoiceByIdHandler];

@Module({
  imports: [CqrsModule, InvoiceRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class InvoiceQueryModule {}
