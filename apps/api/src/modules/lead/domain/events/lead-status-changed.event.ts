import { LEAD_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { LeadStatus } from '@prisma/client';

export interface LeadStatusChangedEventPayload extends IAuditLog {
  readonly leadId: string;
  readonly clinicId: string;
  readonly previousStatus: LeadStatus;
  readonly newStatus: LeadStatus;
}

export class LeadStatusChangedEvent extends BaseEvent {
  static readonly NAME = LEAD_EVENTS.STATUS_CHANGED;

  public readonly leadId: string;
  public readonly clinicId: string;
  public readonly previousStatus: LeadStatus;
  public readonly newStatus: LeadStatus;

  constructor(payload: LeadStatusChangedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.leadId = payload.leadId;
    this.clinicId = payload.clinicId;
    this.previousStatus = payload.previousStatus;
    this.newStatus = payload.newStatus;
  }
}
