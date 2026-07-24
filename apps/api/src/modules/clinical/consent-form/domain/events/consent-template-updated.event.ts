import { CONSENT_TEMPLATE_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface ConsentTemplateUpdatedEventPayload extends IAuditLog {
  readonly templateId: string;
  readonly clinicId: string;
}

export class ConsentTemplateUpdatedEvent extends BaseEvent {
  static readonly NAME = CONSENT_TEMPLATE_EVENTS.UPDATE;

  public readonly templateId: string;
  public readonly clinicId: string;

  constructor(payload: ConsentTemplateUpdatedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.templateId = payload.templateId;
    this.clinicId = payload.clinicId;
  }
}
