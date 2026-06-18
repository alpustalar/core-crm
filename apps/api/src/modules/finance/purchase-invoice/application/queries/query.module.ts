import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPurchaseInvoicesHandler } from './get-purchase-invoices/get-purchase-invoices.handler';
import { PurchaseInvoiceRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/purchase-invoice/purchase-invoice.repository.module';

const QueryHandlers = [GetPurchaseInvoicesHandler];

@Module({
  imports: [CqrsModule, PurchaseInvoiceRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class PurchaseInvoiceQueryModule {}
