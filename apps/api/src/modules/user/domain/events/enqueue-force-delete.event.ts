import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces';
import { USER_EVENTS } from '@src/domain/constants/events';

export interface IEnqueueForceDeleteEventParams {
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

  constructor(params: IEnqueueForceDeleteEventParams) {
    const source = params.source ?? LogSource.SYSTEM;

    super({
      action: LogAction.USER_DELETE,
      actorId: params.actorId,
      details: {
        targetUid: params.firebaseUid,
        reason: params.detail,
      },
      type: params.type,
      source: source,
    });

    this.firebaseUid = params.firebaseUid;
    this.detail = params.detail;
    this.actorId = params.actorId;
    this.type = params.type;
    this.source = source;
  }
}
