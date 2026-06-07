import { BaseEvent } from '@common/interfaces/base-event.interface';
import { ORGANIZATION_EVENTS } from '@src/domain/constants/events';

export interface OrganizationDeletionRequestedEventPayload {
  organizationId: string;
  organizationName: string;
  adminRequestId: string;
  actorEmail: string;
}

export class OrganizationDeletionRequestedEvent extends BaseEvent {
  static readonly NAME = ORGANIZATION_EVENTS.DELETION_REQUESTED;

  readonly organizationId: string;
  readonly organizationName: string;
  readonly adminRequestId: string;
  readonly actorEmail: string;

  constructor(payload: OrganizationDeletionRequestedEventPayload) {
    super();
    this.organizationId = payload.organizationId;
    this.organizationName = payload.organizationName;
    this.adminRequestId = payload.adminRequestId;
    this.actorEmail = payload.actorEmail;
  }
}
