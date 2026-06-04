import { BaseEvent } from '@common/interfaces/base-event.interface';
import { ADMIN_REQUEST_EVENTS } from '@src/domain/constants/events/admin-request.constants';
import { AdminRequestType } from '@prisma/client';

export interface AdminRequestCreatedEventPayload {
  requestId: string;
  type: AdminRequestType;
  targetId: string;
  requestedBy: string;
  organizationId?: string;
}

export class AdminRequestCreatedEvent extends BaseEvent {
  static readonly NAME = ADMIN_REQUEST_EVENTS.CREATED;

  readonly requestId: string;
  readonly type: AdminRequestType;
  readonly targetId: string;
  readonly requestedBy: string;
  readonly organizationId?: string;

  constructor(payload: AdminRequestCreatedEventPayload) {
    super();
    this.requestId = payload.requestId;
    this.type = payload.type;
    this.targetId = payload.targetId;
    this.requestedBy = payload.requestedBy;
    this.organizationId = payload.organizationId;
  }
}
