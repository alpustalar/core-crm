import { ActorContext, BaseEvent } from '@common/interfaces';
import { USER_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

export interface SendUserPasswordResetLinkByActorEventPayload {
  actorId: string;
  source?: LogSource;
  type?: LogType;
  action?: LogAction;
  details?: string;
}

export class SendUserPasswordResetLinkByActorEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.SEND_PASSWORD_RESET_LINK_BY_STAFF;

  public readonly actor: ActorContext;
  public readonly actorId: string;
  public readonly action: LogAction = LogAction.USER_SEND_PASSWORD_RESET_LINK;
  public readonly type: LogType = LogType.INFO;
  public readonly source: LogSource = LogSource.WEB;
  public readonly details: string;

  constructor(payload: SendUserPasswordResetLinkByActorEventPayload) {
    super({
      action: LogAction.USER_SEND_PASSWORD_RESET_LINK,
      actorId: payload.actorId,
      details: '',
      type: LogType.INFO,
      source: LogSource.WEB,
    });

    this.actorId = payload.actorId;
    this.details = payload.details ?? '';
  }
}
