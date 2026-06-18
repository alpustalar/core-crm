import { Module } from '@nestjs/common';
import { InvoiceCommandModule } from './application/commands/command.module';
import { InvoiceQueryModule } from './application/queries/query.module';
import { InvoiceEventModule } from './infrastructure/events/invoice-event.module';

@Module({
  imports: [InvoiceCommandModule, InvoiceQueryModule, InvoiceEventModule],
})
export class InvoiceModule {}
