import { IAuditLog } from '@common/interfaces/audit-log.interface';

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

export class IssueInvoiceCommand {
  constructor(public readonly input: IssueInvoiceCommandInput) {}
}
