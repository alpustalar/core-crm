import { InvoiceNumber } from '@modules/finance/invoice/domain/value-objects/invoice-number.vo';

export interface IssueInvoiceResponse {
  invoiceId: string;
  invoiceNumber: InvoiceNumber | null;
  status: string;
}
