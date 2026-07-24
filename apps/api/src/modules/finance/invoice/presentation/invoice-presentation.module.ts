import { Module } from '@nestjs/common';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceQueryModule } from '@modules/finance/invoice/application/queries/query.module';

@Module({
  imports: [InvoiceQueryModule],
  controllers: [InvoiceController],
})
export class InvoicePresentationModule {}
