import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UpdateUserByStaffEvent } from '@modules/user/domain/events/update-user-by-staff.event';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class UpdateUserByStaffListener {
  private readonly logger = new Logger(UpdateUserByStaffListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(UpdateUserByStaffEvent.NAME, { async: true })
  async handle(event: UpdateUserByStaffEvent) {
    const {
      log,
      metadata: { eventId, correlationId },
    } = event;

    try {
      if (log) {
        const { metadata, source, details, actorId, action, type } = log;

        if (type === LogType.SECURITY) {
          await this.auditLogService.security({
            action,
            source,
            actorId,
            details,
            metadata: {
              ...metadata,
              correlationId,
              eventId,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `AuditLog yazılamadı, correlationId: ${correlationId}, eventId: ${eventId}`
      );
    }
  }
}
