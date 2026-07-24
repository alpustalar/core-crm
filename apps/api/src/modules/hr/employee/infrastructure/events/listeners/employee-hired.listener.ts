import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmployeeHiredEvent } from '@modules/hr/employee/domain/events';
import { AuditLogService } from '@modules/platform/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class EmployeeHiredListener {
  private readonly logger = new Logger(EmployeeHiredListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(EmployeeHiredEvent.NAME, { async: true })
  async handle(event: EmployeeHiredEvent): Promise<void> {
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
      this.logger.error('Personel işe alım audit log hatası', err);
    }
  }
}
