import { Module } from '@nestjs/common';
import { IssueInvoiceHandler } from './issue-invoice/issue-invoice.handler';
import { MarkInvoiceEDocumentResultHandler } from './mark-invoice-edocument-result/mark-invoice-edocument-result.handler';
import { InvoiceInfrastructureModule } from '@modules/finance/invoice/infrastructure/infrastructure.module';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';

export const INVOICE_COMMAND_HANDLERS = [
  IssueInvoiceHandler,
  MarkInvoiceEDocumentResultHandler,
];

@Module({
  imports: [InvoiceInfrastructureModule, ClinicDomainServicesModule],
  providers: INVOICE_COMMAND_HANDLERS,
  exports: INVOICE_COMMAND_HANDLERS,
})
export class InvoiceCommandModule {}
