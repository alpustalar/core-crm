import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';

export interface SubscriptionCreatedPayload extends IAuditLog {
  organizationId: string;
  planId: PlanId;
}

export class SubscriptionCreatedEvent extends BaseEvent {
  static readonly NAME = 'subscription.created';

  organizationId: string;
  planId: PlanId;

  constructor(payload: SubscriptionCreatedPayload) {
    super({
      action: payload.action,
      type: payload.type,
      source: payload.source,
      details: payload.details,
      actorId: payload.actorId,
      metadata: payload.metadata,
    });

    this.organizationId = payload.organizationId;
    this.planId = payload.planId;
  }
}
