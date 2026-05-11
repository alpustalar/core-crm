import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces/base-event.interface';
import { CLINIC_EVENTS } from '@src/domain/constants/events';

export interface ClinicSoftDeleteByOrganizationIdEventParams {
  organizationId?: string;
  actorId?: string;
  actorEmail?: string;
  source?: LogSource;
  action: LogAction;
  type: LogType;
  details: string;
}

export class ClinicSoftDeleteByOrganizationIdEvent extends BaseEvent {
  static readonly NAME = CLINIC_EVENTS.SOFT_DELETED;

  organizationId?: string;
  actorId?: string;
  actorEmail?: string;
  details: string;

  constructor(params: ClinicSoftDeleteByOrganizationIdEventParams) {
    super({
      action: params.action,
      source: params.source,
      details: params.details,
      actorId: params.actorId,
      type: params.type,
    });

    this.organizationId = params.organizationId;
    this.details = params.details;
    this.actorId = params.actorId;
    this.actorEmail = params.actorEmail;
  }
}
