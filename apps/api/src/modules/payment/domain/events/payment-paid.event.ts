import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';

export interface PaymentPaidEventPayload extends IAuditLog {
  paymentId: string;
  appointmentId: string | null;
  clinicId: string;
}

export class PaymentPaidEvent extends BaseEvent {
  public readonly NAME = PAYMENT_EVENTS.PAID;

  public readonly paymentId: string;
  public readonly appointmentId: string | null;
  public readonly clinicId: string;

  constructor(payload: PaymentPaidEventPayload) {
    super({
      action: payload.action,
      source: payload.source,
      metadata: payload.metadata,
      details: payload.details,
      type: payload.type,
    });
    this.paymentId = payload.paymentId;
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
  }
}
