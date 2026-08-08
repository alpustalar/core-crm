import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmployeeTerminatedEvent } from '@modules/hr/employee/domain/events';
import { AuditLogService } from '@modules/platform/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class EmployeeTerminatedListener {
  private readonly logger = new Logger(EmployeeTerminatedListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(EmployeeTerminatedEvent.NAME, { async: true })
  async handle(event: EmployeeTerminatedEvent): Promise<void> {
    const { log, metadata } = event;
    try {
      if (!log) return;
      const { action, details, source, actorId, type } = log;
      const logInput = {
        action,
        source,
        details,
        metadata: {
          eventId: metadata.eventId,
          correlationId: metadata.correlationId,
        },
        actorId,
      };
      if (type === LogType.SECURITY) {
        await this.auditLogService.security(logInput);
      } else {
        await this.auditLogService.info(logInput);
      }
    } catch (err) {
      this.logger.error('Personel fesih audit log hatası', err);
    }
  }
}
