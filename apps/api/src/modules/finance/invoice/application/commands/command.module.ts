import { Module } from '@nestjs/common';
import { IssueInvoiceHandler } from './issue-invoice/issue-invoice.handler';
import { MarkInvoiceEDocumentResultHandler } from './mark-invoice-edocument-result/mark-invoice-edocument-result.handler';
import { InvoiceInfrastructureModule } from '@modules/finance/invoice/infrastructure/infrastructure.module';

export const INVOICE_COMMAND_HANDLERS = [
  IssueInvoiceHandler,
  MarkInvoiceEDocumentResultHandler,
];

@Module({
  imports: [InvoiceInfrastructureModule],
  providers: INVOICE_COMMAND_HANDLERS,
  exports: INVOICE_COMMAND_HANDLERS,
})
export class InvoiceCommandModule {}
