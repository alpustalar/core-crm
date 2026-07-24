import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';
import {
  CreateInvoiceProps,
  FindInvoicesFilter,
} from '@modules/finance/invoice/domain/invoice.contracts';
import { Pagination } from '@shared';

export const INVOICE_COMMAND_REPOSITORY = Symbol('IInvoiceCommandRepository');
export const INVOICE_QUERY_REPOSITORY = Symbol('IInvoiceQueryRepository');

export interface IInvoiceCommandRepository {
  create(props: CreateInvoiceProps): Promise<Invoice>;
  save(entity: Invoice): Promise<Invoice>;
}

export interface IInvoiceQueryRepository {
  findById(id: string): Promise<Invoice | null>;
  findByAppointmentId(appointmentId: string): Promise<Invoice | null>;
  findByPaymentId(paymentId: string): Promise<Invoice | null>;
  findMany(
    filter: FindInvoicesFilter,
    pagination: Pagination
  ): Promise<{ items: Invoice[]; total: number }>;
}
