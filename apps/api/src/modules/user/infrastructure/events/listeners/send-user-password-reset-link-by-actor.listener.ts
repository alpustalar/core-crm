import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendUserPasswordResetLinkByActorEvent } from '@modules/user/domain/events/send-user-password-reset-link-by-actor.event';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class SendUserPasswordResetLinkByActorListener {
  private readonly logger = new Logger(
    SendUserPasswordResetLinkByActorListener.name
  );

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(SendUserPasswordResetLinkByActorEvent.NAME, { async: true })
  async handle(event: SendUserPasswordResetLinkByActorEvent) {
    const { log, metadata } = event;

    try {
      if (log) {
        const {
          actorId,
          source,
          details,
          type,
          metadata: logMetadata,
          action,
        } = log;
        if (type === LogType.SECURITY) {
          await this.auditLogService.security({
            action,
            source,
            actorId,
            details,
            metadata: {
              ...metadata,
              ...logMetadata,
            },
          });
        }
      }
    } catch (e) {
      this.logger.error(e);
      this.logger.error(
        `Audit Log Failure: correlationId: ${metadata.correlationId}, eventId: ${metadata.eventId}}`
      );
    }
  }
}
