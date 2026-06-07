import { ICommand } from '@nestjs/cqrs';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { IssueInvoiceResponse } from './issue-invoice.response';

export type InvoiceTrigger = 'PAYMENT' | 'APPOINTMENT';

export interface IssueInvoiceCommandInput extends IAuditLog {
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  paymentId: string | null;
  amount: number;
  currency?: string;
  trigger: InvoiceTrigger;
}

export class IssueInvoiceCommand implements ICommand {
  readonly __responseType!: IssueInvoiceResponse;
  constructor(public readonly input: IssueInvoiceCommandInput) {}
}
