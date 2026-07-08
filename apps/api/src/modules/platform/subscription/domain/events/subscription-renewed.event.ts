import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface SubscriptionRenewedEventPayload extends IAuditLog {
  subscriptionId: string;
  organizationId: string;
  iyzicoPaymentId: string;
  periodStart: Date;
  periodEnd: Date;
}

export class SubscriptionRenewedEvent extends BaseEvent {
  static readonly NAME = 'subscription.renewed';

  subscriptionId: string;
  organizationId: string;
  iyzicoPaymentId: string;
  periodStart: Date;
  periodEnd: Date;

  constructor(payload: SubscriptionRenewedEventPayload) {
    super({
      action: payload.action,
      type: payload.type,
      source: payload.source,
      details: payload.details,
      actorId: payload.actorId,
      metadata: payload.metadata,
    });
    this.subscriptionId = payload.subscriptionId;
    this.organizationId = payload.organizationId;
    this.iyzicoPaymentId = payload.iyzicoPaymentId;
    this.periodStart = payload.periodStart;
    this.periodEnd = payload.periodEnd;
  }
}
