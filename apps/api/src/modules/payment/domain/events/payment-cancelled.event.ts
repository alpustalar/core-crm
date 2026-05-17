import { BaseEvent } from '@common/interfaces/base-event.interface';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface PaymentCancelledEventPayload extends IAuditLog {
  paymentId: string;
  appointmentId: string | null;
  clinicId: string;
}
export class PaymentCancelledEvent extends BaseEvent {
  public readonly NAME = PAYMENT_EVENTS.CANCELLED;

  public readonly paymentId: string;
  public readonly appointmentId: string | null;
  public readonly clinicId: string;
  constructor(payload: PaymentCancelledEventPayload) {
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
