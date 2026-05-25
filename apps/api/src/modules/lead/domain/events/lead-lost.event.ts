import { LEAD_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface LeadLostEventPayload extends IAuditLog {
  readonly leadId: string;
  readonly clinicId: string;
  readonly lostReason: string | null;
}

export class LeadLostEvent extends BaseEvent {
  static readonly NAME = LEAD_EVENTS.LOST;

  public readonly leadId: string;
  public readonly clinicId: string;
  public readonly lostReason: string | null;

  constructor(payload: LeadLostEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.leadId = payload.leadId;
    this.clinicId = payload.clinicId;
    this.lostReason = payload.lostReason;
  }
}
