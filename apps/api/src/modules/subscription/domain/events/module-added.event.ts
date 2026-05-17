import { BaseEvent } from '@common/interfaces';
import { Decimal } from '@prisma/client/runtime/library';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface ModuleAddedEventPayload extends IAuditLog {
  organizationId: string;
  moduleKey: string;
  priceAtPurchase: Decimal;
}

export class ModuleAddedEvent extends BaseEvent {
  static readonly NAME = 'subscription.module_added';

  organizationId: string;
  moduleKey: string;
  priceAtPurchase: Decimal;

  constructor(payload: ModuleAddedEventPayload) {
    super({
      action: payload.action,
      type: payload.type,
      source: payload.source,
      details: payload.details,
      actorId: payload.actorId,
      metadata: payload.metadata,
    });
    this.organizationId = payload.organizationId;
    this.moduleKey = payload.moduleKey;
    this.priceAtPurchase = payload.priceAtPurchase;
  }
}
