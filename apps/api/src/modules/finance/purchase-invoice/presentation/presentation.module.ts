import { Module } from '@nestjs/common';
import { PurchaseInvoiceController } from '@modules/finance/purchase-invoice/presentation/http/controllers/purchase-invoice.controller';

@Module({ controllers: [PurchaseInvoiceController] })
export class PurchaseInvoicePresentationModule {}
