import { USER_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';

export interface UsersBulkSoftDeletedEventPayload {
  userIds: string[];
}

export class UsersBulkSoftDeletedEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.BULK_SOFT_DELETED;
  public readonly userIds: string[];
  constructor(payload: UsersBulkSoftDeletedEventPayload) {
    super();
    this.userIds = payload.userIds;
  }
}
