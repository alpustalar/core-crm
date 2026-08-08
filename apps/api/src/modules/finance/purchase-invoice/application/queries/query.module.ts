import { Module } from '@nestjs/common';
import { GetPurchaseInvoicesHandler } from './get-purchase-invoices/get-purchase-invoices.handler';
import { PurchaseInvoiceInfrastructureModule } from '@modules/finance/purchase-invoice/infrastructure/infrastructure.module';

const QueryHandlers = [GetPurchaseInvoicesHandler];

@Module({
  imports: [PurchaseInvoiceInfrastructureModule],
  providers: [...QueryHandlers],
})
export class PurchaseInvoiceQueryModule {}
