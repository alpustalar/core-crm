import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LeadLostEvent } from '@modules/lead/domain/events';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class LeadLostListener {
  private readonly logger = new Logger(LeadLostListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(LeadLostEvent.NAME, { async: true })
  async handle(event: LeadLostEvent): Promise<void> {
    const { log, metadata } = event;
    try {
      if (!log) return;
      const { action, details, source, actorId, type } = log;
      const logInput = {
        action,
        source,
        details,
        metadata: { eventId: metadata.eventId, correlationId: metadata.correlationId },
        actorId,
      };
      if (type === LogType.SECURITY) {
        await this.auditLogService.security(logInput);
      } else {
        await this.auditLogService.info(logInput);
      }
    } catch (err) {
      this.logger.error('Lead kayıp audit log hatası', err);
    }
  }
}
