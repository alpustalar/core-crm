import { USER_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces';

export interface IUpdateUserByStaffEventParams {
  userId: string;
  details: string;
  type: LogType;
  action: LogAction;
  actorId: string;
  source?: LogSource;
}

export class UpdateUserByStaffEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.UPDATE_BY_STAFF;

  public readonly userId: string;
  public readonly details: string;
  public readonly type: LogType;
  public readonly action: LogAction;
  public readonly source: LogSource;
  public readonly actorId: string;

  constructor(params: IUpdateUserByStaffEventParams) {
    const source = params.source ?? LogSource.WEB;

    super({
      action: params.action,
      type: params.type,
      actorId: params.actorId,
      source: source,
      details: {
        targetUserId: params.userId,
        description: params.details,
      },
    });

    this.userId = params.userId;
    this.details = params.details;
    this.type = params.type;
    this.action = params.action;
    this.source = source;
    this.actorId = params.actorId;
  }
}
