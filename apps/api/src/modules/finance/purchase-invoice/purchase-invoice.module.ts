import { Module } from '@nestjs/common';
import { PurchaseInvoiceCommandModule } from './application/commands/command.module';
import { PurchaseInvoiceQueryModule } from './application/queries/query.module';
import { PurchaseInvoicePresentationModule } from './presentation/purchase-invoice-presentation.module';

@Module({
  imports: [
    PurchaseInvoiceCommandModule,
    PurchaseInvoiceQueryModule,
    PurchaseInvoicePresentationModule,
  ],
  exports: [PurchaseInvoiceCommandModule, PurchaseInvoiceQueryModule],
})
export class PurchaseInvoiceModule {}
