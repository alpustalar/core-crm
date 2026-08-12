import { Module } from '@nestjs/common';
import { InvoiceQueryController } from '@modules/finance/invoice/presentation/http/controllers/invoice.query.controller';

@Module({ controllers: [InvoiceQueryController] })
export class InvoicePresentationModule {}
