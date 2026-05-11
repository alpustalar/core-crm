import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';

export interface PaymentInitiatedEventParams extends IAuditLog {
  paymentId?: string;
  appointmentId?: string;
  token?: string;
}

export class PaymentInitiatedEvent extends BaseEvent {
  public readonly NAME = PAYMENT_EVENTS.INITIATED;

  public readonly paymentId?: string;
  public readonly appointmentId?: string;
  public readonly token?: string;
  constructor(params: PaymentInitiatedEventParams) {
    super({
      action: params.action,
      source: params.source,
      metadata: params.metadata,
      details: params.details,
      type: params.type,
    });
    this.paymentId = params.paymentId;
    this.appointmentId = params.appointmentId;
    this.token = params.token;
  }
}
