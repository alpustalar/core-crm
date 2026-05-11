import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CreateUserEvent } from '@modules/user/domain/events/create-user.event';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@EventsHandler(CreateUserEvent)
export class CreateUserListener implements IEventHandler<CreateUserEvent> {
  private readonly logger = new Logger(CreateUserListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  async handle(event: CreateUserEvent) {
    const {
      log,
      metadata: { eventId, correlationId },
    } = event;

    try {
      if (log) {
        const {
          details,
          source,
          metadata: logMetadata,
          type,
          actorId,
          action,
        } = log;

        if (type === LogType.SECURITY) {
          await this.auditLogService.security({
            action,
            source,
            actorId,
            details,
            metadata: {
              correlationId,
              eventId,
              ...logMetadata,
            },
          });
        }
      }
    } catch (e) {
      this.logger.error(
        `Audit Log Failure: correlationId: ${correlationId}, eventId: ${eventId}`,
        e.stack
      );
    }
  }
}
