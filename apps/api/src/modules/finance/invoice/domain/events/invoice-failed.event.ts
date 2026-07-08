import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';
import { INVOICE_EVENTS } from '@src/domain/constants/events/invoice.constants';

export interface InvoiceFailedEventPayload extends IAuditLog {
  invoiceId: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  paymentId: string | null;
  reason: string;
}

export class InvoiceFailedEvent extends BaseEvent {
  static readonly NAME = INVOICE_EVENTS.FAILED;

  public readonly invoiceId: string;
  public readonly organizationId: string;
  public readonly clinicId: string;
  public readonly patientId: string;
  public readonly appointmentId: string | null;
  public readonly paymentId: string | null;
  public readonly reason: string;

  constructor(payload: InvoiceFailedEventPayload) {
    super(payload);
    this.invoiceId = payload.invoiceId;
    this.organizationId = payload.organizationId;
    this.clinicId = payload.clinicId;
    this.patientId = payload.patientId;
    this.appointmentId = payload.appointmentId;
    this.paymentId = payload.paymentId;
    this.reason = payload.reason;
  }
}
