import { Module } from '@nestjs/common';
import { IssueInvoiceHandler } from './issue-invoice/issue-invoice.handler';
import { InvoiceRepositoryModule } from '@modules/invoice/infrastructure/persistence/prisma/repositories/invoice/invoice.repository.module';
import { InvoiceProviderModule } from '@modules/invoice/infrastructure/providers/invoice-provider.module';
import { ContextModule } from '@src/infrastructure/context/context.module';

export const INVOICE_COMMAND_HANDLERS = [IssueInvoiceHandler];

@Module({
  imports: [InvoiceRepositoryModule, InvoiceProviderModule, ContextModule],
  providers: INVOICE_COMMAND_HANDLERS,
  exports: INVOICE_COMMAND_HANDLERS,
})
export class InvoiceCommandModule {}
