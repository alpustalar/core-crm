import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces/base-event.interface';

export interface ClinicCreatedEventPayload {
  readonly clinicId: string;
  readonly organizationId?: string;
  readonly actorId?: string;
}

export class ClinicCreatedEvent extends BaseEvent {
  static readonly NAME = CLINIC_EVENTS.CREATED;

  public readonly clinicId: string;
  public readonly organizationId?: string;
  public readonly actorId?: string;

  constructor(payload: ClinicCreatedEventPayload) {
    super();
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
    this.actorId = payload.actorId;
  }
}
