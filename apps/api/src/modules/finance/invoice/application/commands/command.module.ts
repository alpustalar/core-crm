import { Module } from '@nestjs/common';
import { IssueInvoiceHandler } from './issue-invoice/issue-invoice.handler';
import { MarkInvoiceEDocumentResultHandler } from './mark-invoice-edocument-result/mark-invoice-edocument-result.handler';
import { InvoiceRepositoryModule } from '@modules/finance/invoice/infrastructure/persistence/prisma/repositories/invoice/invoice.repository.module';
import { ContextModule } from '@src/infrastructure/context/context.module';

export const INVOICE_COMMAND_HANDLERS = [
  IssueInvoiceHandler,
  MarkInvoiceEDocumentResultHandler,
];

@Module({
  imports: [InvoiceRepositoryModule, ContextModule],
  providers: INVOICE_COMMAND_HANDLERS,
  exports: INVOICE_COMMAND_HANDLERS,
})
export class InvoiceCommandModule {}
