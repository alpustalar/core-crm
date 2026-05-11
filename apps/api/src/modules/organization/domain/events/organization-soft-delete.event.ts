import { BaseEvent } from '@common/interfaces/base-event.interface';
import { ORGANIZATION_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

export interface OrganizationSoftDeleteEventParams {
  organizationId: string;
  organizationName: string;
  details: string;
  actorId: string;
  type?: LogType;
  source?: LogSource;
  action: LogAction;
}

export class OrganizationSoftDeleteEvent extends BaseEvent {
  static readonly NAME = ORGANIZATION_EVENTS.SOFT_DELETED;

  readonly organizationId: string;
  readonly organizationName: string;

  public readonly details: string;
  public readonly actorId: string;
  public readonly type: LogType;
  public readonly source: LogSource;
  public readonly action: LogAction;

  constructor(params: OrganizationSoftDeleteEventParams) {
    const type = params.type ?? LogType.INFO;
    const source = params.source ?? LogSource.WEB;

    super({
      action: LogAction.USER_REGISTER,
      actorId: params.actorId,
      details: params.details,
      type,
      source,
    });

    this.organizationId = params.organizationId;
    this.organizationName = params.organizationName;
    this.actorId = params.actorId;
  }
}
