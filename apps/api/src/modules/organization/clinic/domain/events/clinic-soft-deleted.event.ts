import { BaseEvent } from '@common/interfaces/base-event.interface';
import { CLINIC_EVENTS } from '@src/domain/constants/events';

export interface ClinicSoftDeletedEventPayload {
  clinicId: string;
  organizationId?: string;
  actorId?: string;
  actorEmail?: string;
}

export class ClinicSoftDeletedEvent extends BaseEvent {
  static readonly NAME = CLINIC_EVENTS.SOFT_DELETED;

  readonly clinicId: string;
  readonly organizationId?: string;
  readonly actorId?: string;
  readonly actorEmail?: string;

  constructor(payload: ClinicSoftDeletedEventPayload) {
    super();
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
    this.actorId = payload.actorId;
    this.actorEmail = payload.actorEmail;
  }
}
