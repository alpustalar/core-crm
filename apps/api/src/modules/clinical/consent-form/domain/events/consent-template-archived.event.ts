import { CONSENT_TEMPLATE_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface ConsentTemplateArchivedEventPayload extends IAuditLog {
  readonly templateId: string;
  readonly clinicId: string;
}

export class ConsentTemplateArchivedEvent extends BaseEvent {
  static readonly NAME = CONSENT_TEMPLATE_EVENTS.ARCHIVE;

  public readonly templateId: string;
  public readonly clinicId: string;

  constructor(payload: ConsentTemplateArchivedEventPayload) {
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
