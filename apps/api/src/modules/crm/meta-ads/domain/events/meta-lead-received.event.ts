import { META_ADS_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface MetaLeadReceivedEventPayload extends IAuditLog {
  readonly metaLeadId: string;
  readonly clinicId: string;
  readonly campaignId: string | null;
  readonly status: string;
}

export class MetaLeadReceivedEvent extends BaseEvent {
  static readonly NAME = META_ADS_EVENTS.LEAD_RECEIVED;

  public readonly metaLeadId: string;
  public readonly clinicId: string;
  public readonly campaignId: string | null;
  public readonly status: string;

  constructor(payload: MetaLeadReceivedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.metaLeadId = payload.metaLeadId;
    this.clinicId = payload.clinicId;
    this.campaignId = payload.campaignId;
    this.status = payload.status;
  }
}
