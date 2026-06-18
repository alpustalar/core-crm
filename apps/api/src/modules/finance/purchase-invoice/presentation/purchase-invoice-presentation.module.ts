import { Module } from '@nestjs/common';
import { PurchaseInvoiceController } from './controllers/purchase-invoice.controller';
import { PurchaseInvoiceCommandModule } from '@modules/finance/purchase-invoice/application/commands/command.module';
import { PurchaseInvoiceQueryModule } from '@modules/finance/purchase-invoice/application/queries/query.module';

@Module({
  imports: [PurchaseInvoiceCommandModule, PurchaseInvoiceQueryModule],
  controllers: [PurchaseInvoiceController],
})
export class PurchaseInvoicePresentationModule {}
