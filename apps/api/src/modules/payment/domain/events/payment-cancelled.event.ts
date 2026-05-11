import { BaseEvent } from '@common/interfaces/base-event.interface';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface PaymentCancelledEventParams extends IAuditLog {
  paymentId: string;
  appointmentId: string | null;
  clinicId: string;
}
export class PaymentCancelledEvent extends BaseEvent {
  public readonly NAME = PAYMENT_EVENTS.CANCELLED;

  public readonly paymentId: string;
  public readonly appointmentId: string | null;
  public readonly clinicId: string;
  constructor(params: PaymentCancelledEventParams) {
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
