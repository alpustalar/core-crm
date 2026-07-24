import { Module } from '@nestjs/common';
import { InvoiceCommandModule } from './application/commands/command.module';
import { InvoiceQueryModule } from './application/queries/query.module';
import { InvoiceEventModule } from './infrastructure/events/invoice-event.module';
import { InvoicePresentationModule } from './presentation/invoice-presentation.module';

@Module({
  imports: [
    InvoiceCommandModule,
    InvoiceQueryModule,
    InvoiceEventModule,
    InvoicePresentationModule,
  ],
})
export class InvoiceModule {}
