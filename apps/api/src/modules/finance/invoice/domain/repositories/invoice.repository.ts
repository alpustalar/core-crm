import { Invoice } from '@prisma/client';
import { CreateInvoiceProps } from '@modules/finance/invoice/domain/types/create-invoice.props';

export const INVOICE_COMMAND_REPOSITORY = Symbol('IInvoiceCommandRepository');
export const INVOICE_QUERY_REPOSITORY = Symbol('IInvoiceQueryRepository');

export interface IInvoiceCommandRepository {
  create(props: CreateInvoiceProps): Promise<Invoice>;
  markAsIssued(props: {
    invoiceId: string;
    invoiceNumber: string;
    providerRef: string;
    issuedAt: Date;
    rawResponse?: unknown;
  }): Promise<Invoice>;
  markAsFailed(invoiceId: string): Promise<Invoice>;
}

export interface IInvoiceQueryRepository {
  findById(id: string): Promise<Invoice | null>;
  findByAppointmentId(appointmentId: string): Promise<Invoice | null>;
  findByPaymentId(paymentId: string): Promise<Invoice | null>;
}
