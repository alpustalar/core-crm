import { Module } from '@nestjs/common';
import { GetInvoiceByIdHandler } from './get-invoice-by-id/get-invoice-by-id.handler';
import { GetInvoiceByPaymentIdHandler } from './get-invoice-by-payment-id/get-invoice-by-payment-id.handler';
import { FindInvoicesHandler } from './find-invoices/find-invoices.handler';
import { InvoiceRepositoriesModule } from '@modules/finance/invoice/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [
  GetInvoiceByIdHandler,
  GetInvoiceByPaymentIdHandler,
  FindInvoicesHandler,
];

@Module({
  imports: [InvoiceRepositoriesModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class InvoiceQueryModule {}
