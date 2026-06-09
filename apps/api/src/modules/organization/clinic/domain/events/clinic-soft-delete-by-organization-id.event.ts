import { BaseEvent } from '@common/interfaces/base-event.interface';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface ClinicSoftDeleteByOrganizationIdEventPayload
  extends IAuditLog {
  organizationId?: string;
  actorId?: string;
  actorEmail?: string;
}

export class ClinicSoftDeleteByOrganizationIdEvent extends BaseEvent {
  static readonly NAME = CLINIC_EVENTS.MANY_SOFT_DELETED;

  organizationId?: string;
  actorId?: string;
  actorEmail?: string;
  details: string;

  constructor(params: ClinicSoftDeleteByOrganizationIdEventPayload) {
    super({
      action: params.action,
      source: params.source,
      details: params.details,
      actorId: params.actorId,
      type: params.type,
    });

    this.organizationId = params.organizationId;
    this.actorId = params.actorId;
    this.actorEmail = params.actorEmail;
  }
}
