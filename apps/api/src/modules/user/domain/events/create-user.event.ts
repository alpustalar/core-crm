// src/domain/user/events/create-user.event.ts

import { USER_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces';

export interface ICreateUserEventParams {
  details: string;
  actorId: string;
  type?: LogType;
  source?: LogSource;
  action: LogAction;
}

export class CreateUserEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.CREATE;

  public readonly details: string;
  public readonly actorId: string;
  public readonly type: LogType;
  public readonly source: LogSource;
  public readonly action: LogAction;

  constructor(params: ICreateUserEventParams) {
    const type = params.type ?? LogType.INFO;
    const source = params.source ?? LogSource.WEB;

    super({
      action: LogAction.USER_REGISTER,
      actorId: params.actorId,
      details: params.details,
      type,
      source,
    });

    this.details = params.details;
    this.actorId = params.actorId;
    this.type = type;
    this.source = source;
    this.action = params.action;
  }
}
