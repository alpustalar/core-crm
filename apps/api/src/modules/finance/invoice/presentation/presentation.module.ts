import { Module } from '@nestjs/common';
import { InvoiceController } from '@modules/finance/invoice/presentation/http/controllers/invoice.controller';

@Module({ controllers: [InvoiceController] })
export class InvoicePresentationModule {}
