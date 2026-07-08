import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface SubscriptionActivatedEventPayload extends IAuditLog {
  subscriptionId: string;
  organizationId: string;
  iyzicoPaymentId: string;
}

export class SubscriptionActivatedEvent extends BaseEvent {
  static readonly NAME = 'subscription.activated';

  subscriptionId: string;
  organizationId: string;
  iyzicoPaymentId: string;

  constructor(payload: SubscriptionActivatedEventPayload) {
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
  }
}
