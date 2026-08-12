import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MetaAccountDisconnectedEvent } from '@modules/crm/meta-ads/domain/events';
import { AuditLogService } from '@modules/platform/audit-log/audit-log.service';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class MetaAccountDisconnectedListener {
  private readonly logger = new Logger(MetaAccountDisconnectedListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(MetaAccountDisconnectedEvent.NAME, { async: true })
  async handle(event: MetaAccountDisconnectedEvent): Promise<void> {
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
      this.logger.error('Meta hesap bağlantı kesme audit log hatası', err);
    }
  }
}
