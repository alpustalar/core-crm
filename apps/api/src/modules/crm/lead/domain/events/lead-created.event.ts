import { LEAD_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { LeadSourceType as LeadSource } from '@input-type-schemas/LeadSourceSchema';

export interface LeadCreatedEventPayload extends IAuditLog {
  readonly leadId: string;
  readonly clinicId: string;
  readonly leadSource: LeadSource;
}

export class LeadCreatedEvent extends BaseEvent {
  static readonly NAME = LEAD_EVENTS.CREATED;

  public readonly leadId: string;
  public readonly clinicId: string;
  public readonly leadSource: LeadSource;

  constructor(payload: LeadCreatedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.leadId = payload.leadId;
    this.clinicId = payload.clinicId;
    this.leadSource = payload.leadSource;
  }
}
