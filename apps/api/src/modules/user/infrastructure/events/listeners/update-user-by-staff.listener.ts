import { EventsHandler, IEventHandler } from '@nestjs/cqrs'; // Yeni dekoratör ve interface
import { UpdateUserByStaffEvent } from '@modules/user/domain/events/update-user-by-staff.event';
import { Logger } from '@nestjs/common';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@EventsHandler(UpdateUserByStaffEvent)
export class UpdateUserByStaffListener
  implements IEventHandler<UpdateUserByStaffEvent>
{
  private readonly logger = new Logger(UpdateUserByStaffListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

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
        `AuditLog yazılamadı, correlationId: ${correlationId}, eventId: ${eventId}}`
      );
    }
  }
}
