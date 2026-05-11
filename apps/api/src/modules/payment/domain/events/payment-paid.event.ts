import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';

export interface PaymentPaidEventParams extends IAuditLog {
  paymentId: string;
  appointmentId: string | null;
  clinicId: string;
}

export class PaymentPaidEvent extends BaseEvent {
  public readonly NAME = PAYMENT_EVENTS.PAID;

  public readonly paymentId: string;
  public readonly appointmentId: string | null;
  public readonly clinicId: string;

  constructor(event: PaymentPaidEventParams) {
    super({
      action: event.action,
      source: event.source,
      metadata: event.metadata,
      details: event.details,
      type: event.type,
    });
    this.paymentId = event.paymentId;
    this.appointmentId = event.appointmentId;
    this.clinicId = event.clinicId;
  }
}
