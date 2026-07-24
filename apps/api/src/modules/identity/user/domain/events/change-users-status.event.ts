import { USER_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';

export interface ChangeUsersStatusEventPayload {
  userIds: string[];
}

export class ChangeUsersStatusEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.BULK_CHANGE_STATUS;
  public readonly userIds: string[];
  constructor(payload: ChangeUsersStatusEventPayload) {
    super();
    this.userIds = payload.userIds;
  }
}
