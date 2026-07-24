import { USER_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces';

export interface UserDeletedEventPayload {
  userId: string;
  details: string;
  type: LogType;
  action: LogAction;
  actorId: string;
  source?: LogSource;
}

export class UserDeletedEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.SOFT_DELETED;

  public readonly userId: string;

  constructor(payload: UserDeletedEventPayload) {
    const source = payload.source ?? LogSource.WEB;

    super({
      action: payload.action,
      type: payload.type,
      actorId: payload.actorId,
      source: source,
      details: {
        targetUserId: payload.userId,
        description: payload.details,
      },
    });

    this.userId = payload.userId;
  }
}
