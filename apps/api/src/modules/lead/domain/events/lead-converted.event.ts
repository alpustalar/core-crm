import { LEAD_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface LeadConvertedEventPayload extends IAuditLog {
  readonly leadId: string;
  readonly clinicId: string;
  readonly patientId: string | null;
  readonly appointmentId: string | null;
}

export class LeadConvertedEvent extends BaseEvent {
  static readonly NAME = LEAD_EVENTS.CONVERTED;

  public readonly leadId: string;
  public readonly clinicId: string;
  public readonly patientId: string | null;
  public readonly appointmentId: string | null;

  constructor(payload: LeadConvertedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.leadId = payload.leadId;
    this.clinicId = payload.clinicId;
    this.patientId = payload.patientId;
    this.appointmentId = payload.appointmentId;
  }
}
