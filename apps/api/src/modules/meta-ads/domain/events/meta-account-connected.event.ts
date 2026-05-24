import { META_ADS_EVENTS } from '@src/domain/constants/events';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface MetaAccountConnectedEventPayload extends IAuditLog {
  readonly metaAdAccountId: string;
  readonly clinicId: string;
  readonly adAccountId: string;
}

export class MetaAccountConnectedEvent extends BaseEvent {
  static readonly NAME = META_ADS_EVENTS.ACCOUNT_CONNECTED;

  public readonly metaAdAccountId: string;
  public readonly clinicId: string;
  public readonly adAccountId: string;

  constructor(payload: MetaAccountConnectedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.metaAdAccountId = payload.metaAdAccountId;
    this.clinicId = payload.clinicId;
    this.adAccountId = payload.adAccountId;
  }
}
