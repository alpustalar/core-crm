import { BaseEvent } from '@common/interfaces/base-event.interface';
import { SECURITY_EVENTS } from '@src/domain/constants/events/security.constant';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

export interface PatientPolicyAccessDeniedEventPayload {
  patientId: string;
  organizationId?: string;
  reason: string;
  operation?: string;
}

export class PatientPolicyAccessDeniedEvent extends BaseEvent {
  static readonly NAME = SECURITY_EVENTS.PATIENT_ACCESS_DENIED;

  readonly patientId: string;
  readonly organizationId?: string;
  readonly reason: string;

  constructor(payload: PatientPolicyAccessDeniedEventPayload) {
    super({
      action: LogAction.PATIENT_ACCESS_DENIED,
      type: LogType.SECURITY,
      actorId: payload.patientId,
      details: { reason: payload.reason, operation: payload.operation },
    });
    this.patientId = payload.patientId;
    this.organizationId = payload.organizationId;
    this.reason = payload.reason;
  }
}
