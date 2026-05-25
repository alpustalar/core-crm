import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LeadConvertedEvent } from '@modules/lead/domain/events';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class LeadConvertedListener {
  private readonly logger = new Logger(LeadConvertedListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(LeadConvertedEvent.NAME, { async: true })
  async handle(event: LeadConvertedEvent): Promise<void> {
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
      this.logger.error('Lead dönüşüm audit log hatası', err);
    }
  }
}
