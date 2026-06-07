import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface SubscriptionPaymentFailedEventPayload extends IAuditLog {
  subscriptionId: string;
  organizationId: string;
  errorMessage?: string;
}

export class SubscriptionPaymentFailedEvent extends BaseEvent {
  static readonly NAME = 'subscription.payment_failed';

  subscriptionId: string;
  organizationId: string;
  errorMessage?: string;

  constructor(payload: SubscriptionPaymentFailedEventPayload) {
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
    this.errorMessage = payload.errorMessage;
  }
}
