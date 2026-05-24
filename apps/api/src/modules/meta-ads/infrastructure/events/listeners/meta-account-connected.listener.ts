import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MetaAccountConnectedEvent } from '@modules/meta-ads/domain/events';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class MetaAccountConnectedListener {
  private readonly logger = new Logger(MetaAccountConnectedListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(MetaAccountConnectedEvent.NAME, { async: true })
  async handle(event: MetaAccountConnectedEvent): Promise<void> {
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
      this.logger.error('Meta hesap bağlantı audit log hatası', err);
    }
  }
}
