import { BaseEvent } from '@common/interfaces';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface PaymentRefundedEventParams extends IAuditLog {
  paymentId: string;
  appointmentId: string | null;
  clinicId: string;
}

export class PaymentRefundedEvent extends BaseEvent {
  readonly name = PAYMENT_EVENTS.REFUNDED;

  public readonly paymentId: string;
  public readonly appointmentId: string | null;
  public readonly clinicId: string;

  constructor(params: PaymentRefundedEventParams) {
    super({
      action: params.action,
      source: params.source,
      metadata: params.metadata,
      details: params.details,
      type: params.type,
    });

    this.paymentId = params.paymentId;
    this.appointmentId = params.appointmentId;
    this.clinicId = params.clinicId;
  }
}
