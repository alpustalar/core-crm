import { BaseEvent } from '@common/interfaces';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface PaymentRefundedEventPayload extends IAuditLog {
  installmentId: string;
  paymentId: string;
  appointmentId: string | null;
  clinicId: string;
}

export class PaymentRefundedEvent extends BaseEvent {
  static readonly NAME = PAYMENT_EVENTS.REFUNDED;

  public readonly installmentId: string;
  public readonly paymentId: string;
  public readonly appointmentId: string | null;
  public readonly clinicId: string;

  constructor(payload: PaymentRefundedEventPayload) {
    super({
      action: payload.action,
      source: payload.source,
      metadata: payload.metadata,
      details: payload.details,
      type: payload.type,
    });

    this.installmentId = payload.installmentId;
    this.paymentId = payload.paymentId;
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
  }
}
