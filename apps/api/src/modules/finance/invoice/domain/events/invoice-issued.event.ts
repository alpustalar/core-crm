import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';
import { INVOICE_EVENTS } from '@src/domain/constants/events/invoice.constants';

export interface InvoiceIssuedEventPayload extends IAuditLog {
  invoiceId: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  paymentId: string | null;
  invoiceNumber: string;
}

export class InvoiceIssuedEvent extends BaseEvent {
  static readonly NAME = INVOICE_EVENTS.ISSUED;

  public readonly invoiceId: string;
  public readonly clinicId: string;
  public readonly patientId: string;
  public readonly appointmentId: string | null;
  public readonly paymentId: string | null;
  public readonly invoiceNumber: string;

  constructor(payload: InvoiceIssuedEventPayload) {
    super(payload);
    this.invoiceId = payload.invoiceId;
    this.clinicId = payload.clinicId;
    this.patientId = payload.patientId;
    this.appointmentId = payload.appointmentId;
    this.paymentId = payload.paymentId;
    this.invoiceNumber = payload.invoiceNumber;
  }
}
