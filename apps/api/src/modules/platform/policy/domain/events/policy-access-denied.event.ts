import { BaseEvent } from '@common/interfaces/base-event.interface';
import { SECURITY_EVENTS } from '@src/domain/constants/events/security.constants';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';

export interface PolicyAccessDeniedEventPayload {
  actorId: string;
  source: LogSource;
  organizationId?: string;
  reason: string;
  operation?: string;
}

export class PolicyAccessDeniedEvent extends BaseEvent {
  static readonly NAME = SECURITY_EVENTS.ACCESS_DENIED;

  readonly actorId: string;
  readonly organizationId?: string;
  readonly reason: string;
  readonly source: LogSource;

  constructor(payload: PolicyAccessDeniedEventPayload) {
    super({
      action: LogAction.ACCESS_DENIED,
      source: payload.source,
      type: LogType.SECURITY,
      actorId: payload.actorId,
      details: { reason: payload.reason, operation: payload.operation },
    });
    this.actorId = payload.actorId;
    this.organizationId = payload.organizationId;
    this.reason = payload.reason;
    this.source = payload.source;
  }
}
