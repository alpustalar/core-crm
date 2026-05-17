import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface ClinicCreatedEventPayload extends IAuditLog {
  readonly clinicId: string;
  readonly organizationId?: string;
}

export class ClinicCreatedEvent extends BaseEvent {
  static readonly NAME = CLINIC_EVENTS.CREATED;

  public readonly clinicId: string;
  public readonly organizationId?: string;

  constructor(payload: ClinicCreatedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
  }
}
