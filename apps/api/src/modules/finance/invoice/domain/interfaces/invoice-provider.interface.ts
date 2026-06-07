export const INVOICE_PROVIDER = Symbol('IInvoiceProvider');

export interface IssueInvoiceInput {
  invoiceId: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  paymentId: string | null;
  amount: number;
  currency: string;
}

export interface IssueInvoiceResult {
  invoiceNumber: string;
  providerRef: string;
  issuedAt: Date;
  rawResponse?: unknown;
}

export interface IInvoiceProvider {
  issue(input: IssueInvoiceInput): Promise<IssueInvoiceResult>;
}
