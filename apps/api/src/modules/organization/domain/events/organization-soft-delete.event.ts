import { BaseEvent } from '@common/interfaces/base-event.interface';
import { ORGANIZATION_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface OrganizationSoftDeleteEventPayload extends IAuditLog {
  organizationId: string;
  organizationName: string;
}

export class OrganizationSoftDeleteEvent extends BaseEvent {
  static readonly NAME = ORGANIZATION_EVENTS.SOFT_DELETED;

  readonly organizationId: string;
  readonly organizationName: string;

  constructor(payload: OrganizationSoftDeleteEventPayload) {
    const type = payload.type ?? LogType.INFO;
    const source = payload.source ?? LogSource.WEB;

    super({
      action: LogAction.USER_REGISTER,
      actorId: payload.actorId,
      details: payload.details,
      type,
      source,
    });

    this.organizationId = payload.organizationId;
    this.organizationName = payload.organizationName;
  }
}
