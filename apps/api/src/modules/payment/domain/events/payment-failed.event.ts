import { BaseEvent } from '@common/interfaces/base-event.interface';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface PaymentFailedParams extends IAuditLog {
  paymentId: string;
  appointmentId: string | null;
  clinicId: string;
}

export class PaymentFailedEvent extends BaseEvent {
  public readonly NAME = PAYMENT_EVENTS.FAILED;

  public readonly paymentId: string;
  public readonly appointmentId: string | null;
  public readonly clinicId: string;

  constructor(params: PaymentFailedParams) {
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
