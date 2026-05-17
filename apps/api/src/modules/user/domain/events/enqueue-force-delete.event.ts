import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces';
import { USER_EVENTS } from '@src/domain/constants/events';

export interface EnqueueForceDeleteEventPayload {
  firebaseUid: string;
  detail?: string;
  actorId: string;
  type: LogType;
  source?: LogSource;
}

export class EnqueueForceDeleteEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.UPDATE_BY_STAFF;

  public readonly firebaseUid: string;
  public readonly detail?: string;
  public readonly actorId: string;
  public readonly type: LogType;
  public readonly action: LogAction = LogAction.USER_DELETE; // Sabit action
  public readonly source: LogSource;

  constructor(payload: EnqueueForceDeleteEventPayload) {
    const source = payload.source ?? LogSource.SYSTEM;

    super({
      action: LogAction.USER_DELETE,
      actorId: payload.actorId,
      details: {
        targetUid: payload.firebaseUid,
        reason: payload.detail,
      },
      type: payload.type,
      source: source,
    });

    this.firebaseUid = payload.firebaseUid;
    this.detail = payload.detail;
    this.actorId = payload.actorId;
    this.type = payload.type;
    this.source = source;
  }
}
