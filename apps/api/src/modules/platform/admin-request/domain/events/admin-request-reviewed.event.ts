import { BaseEvent } from '@common/interfaces/base-event.interface';
import { ADMIN_REQUEST_EVENTS } from '@src/domain/constants/events/admin-request.constant';
import { AdminRequestStatusType as AdminRequestStatus } from '@input-type-schemas/AdminRequestStatusSchema';
import { AdminRequestTypeType as AdminRequestType } from '@input-type-schemas/AdminRequestTypeSchema';

export interface AdminRequestReviewedEventPayload {
  requestId: string;
  type: AdminRequestType;
  status: AdminRequestStatus;
  targetId: string;
  requestedBy: string;
  reviewedBy: string;
  organizationId?: string;
  reviewNote?: string;
}

export class AdminRequestReviewedEvent extends BaseEvent {
  static readonly NAME = ADMIN_REQUEST_EVENTS.REVIEWED;

  readonly requestId: string;
  readonly type: AdminRequestType;
  readonly status: AdminRequestStatus;
  readonly targetId: string;
  readonly requestedBy: string;
  readonly reviewedBy: string;
  readonly organizationId?: string;
  readonly reviewNote?: string;

  constructor(payload: AdminRequestReviewedEventPayload) {
    super();
    this.requestId = payload.requestId;
    this.type = payload.type;
    this.status = payload.status;
    this.targetId = payload.targetId;
    this.requestedBy = payload.requestedBy;
    this.reviewedBy = payload.reviewedBy;
    this.organizationId = payload.organizationId;
    this.reviewNote = payload.reviewNote;
  }
}
