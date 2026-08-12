import { Module } from '@nestjs/common';
import { PurchaseInvoiceQueryController } from '@modules/finance/purchase-invoice/presentation/http/controllers/purchase-invoice.query.controller';
import { PurchaseInvoiceCommandController } from '@modules/finance/purchase-invoice/presentation/http/controllers/purchase-invoice.command.controller';

@Module({ controllers: [PurchaseInvoiceQueryController, PurchaseInvoiceCommandController] })
export class PurchaseInvoicePresentationModule {}
