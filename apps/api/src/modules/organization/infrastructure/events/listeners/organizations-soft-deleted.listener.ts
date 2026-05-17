import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { OrganizationSoftDeleteEvent } from '@modules/organization/domain/events';
import { LogType } from '@src/domain/constants/log-action.constant';
import { AuditLogService } from '@modules/audit-log/audit-log.service';

@Injectable()
export class OrganizationsSoftDeletedListener {
  private readonly logger = new Logger(OrganizationsSoftDeletedListener.name);

  constructor(private readonly auditLogService: AuditLogService) {
    // private readonly cleanupProducer: OrganizationCleanupProducer, // Muhtemelen buraya gelecek
  }

  @OnEvent(OrganizationSoftDeleteEvent.NAME, { async: true })
  async handle(event: OrganizationSoftDeleteEvent) {
    const { organizationId, metadata, log } = event;

    if (log) {
      const { action, actorId, source, type } = log;
      if (type === LogType.SECURITY) {
        await this.auditLogService.security({
          action,
          source,
          metadata,
          details: 'organizationId: ' + organizationId,
          actorId,
        });
      }

      this.logger.log(`Organization soft deletion process started`, {
        organizationId,
        actorId,
        correlationId: metadata.correlationId,
      });
    }

    try {
      // TODO: 2. Asıl yan etki (Side Effect) burada tetiklenir
      //       // Örn: Bu organizasyona bağlı kullanıcıları veya verileri temizlemek için kuyruğa at
      //       // await this.cleanupProducer.addToCleanupQueue({ organizationId, correlationId });
      //
    } catch (error) {
      this.logger.error(`Failed to process organization cleanup`, {
        organizationId,
        error: JSON.stringify(error),
        correlationId: metadata.correlationId,
      });
    }
  }
}
