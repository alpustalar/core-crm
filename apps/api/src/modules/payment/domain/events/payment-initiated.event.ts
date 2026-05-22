import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';

export interface PaymentInitiatedEventPayload extends IAuditLog {
  installmentId?: string;
  paymentId?: string;
  appointmentId?: string;
  token?: string;
}

export class PaymentInitiatedEvent extends BaseEvent {
  static readonly NAME = PAYMENT_EVENTS.INITIATED;

  public readonly installmentId?: string;
  public readonly paymentId?: string;
  public readonly appointmentId?: string;
  public readonly token?: string;
  constructor(payload: PaymentInitiatedEventPayload) {
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
    this.token = payload.token;
  }
}
