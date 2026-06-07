import { Module } from '@nestjs/common';
import { InvoiceCommandModule } from './application/commands/command.module';
import { InvoiceEventModule } from './infrastructure/events/invoice-event.module';

@Module({
  imports: [InvoiceCommandModule, InvoiceEventModule],
})
export class InvoiceModule {}

// TODO: FATURA ENTEGRATÖRÜ EKLE
