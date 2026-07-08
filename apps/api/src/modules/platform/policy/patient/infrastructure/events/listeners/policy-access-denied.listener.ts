import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from '@modules/platform/audit-log/audit-log.service';
import { PatientPolicyAccessDeniedEvent } from '@modules/platform/policy/patient/domain/events/patient-policy-access-denied.event';

@Injectable()
export class PatientPolicyAccessDeniedListener {
  private readonly logger = new Logger(PatientPolicyAccessDeniedListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(PatientPolicyAccessDeniedEvent.NAME, { async: true })
  async handle(event: PatientPolicyAccessDeniedEvent): Promise<void> {
    const {
      log,
      metadata: { eventId, correlationId },
    } = event;

    if (!log) return;

    try {
      await this.auditLogService.security({
        action: log.action,
        source: log.source,
        actorId: log.actorId,
        details: log.details,
        metadata: { eventId, correlationId },
      });
    } catch (error) {
      this.logger.error('PatientPolicyAccessDenied audit log failed', error);
    }
  }
}
