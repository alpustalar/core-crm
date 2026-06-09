import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from '@modules/platform/audit-log/audit-log.service';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { ClinicSoftDeleteByOrganizationIdEvent } from '@modules/organization/clinic/domain/events/clinic-soft-delete-by-organization-id.event';
import { ClinicSoftDeletedEvent } from '@modules/organization/clinic/domain/events/clinic-soft-deleted.event';
import { ClinicSoftDeleteRequestedEvent } from '@modules/organization/clinic/domain/events/clinic-soft-delete-requested.event';
import {
  IMailService,
  MAIL_SERVICE,
} from '@modules/platform/mail/domain/interfaces/mail.service.interface';

@Injectable()
export class ClinicDeletedListener {
  private readonly logger = new Logger(ClinicDeletedListener.name);
  constructor(
    private auditLogService: AuditLogService,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService
  ) {}

  @OnEvent(CLINIC_EVENTS.SOFT_DELETED, { async: true })
  async handleClinicDeleted(_event: ClinicSoftDeletedEvent) {
    // system-initiated direct deletion — no mail
  }

  @OnEvent(CLINIC_EVENTS.SOFT_DELETE_REQUESTED, { async: true })
  async handleClinicDeleteRequested(event: ClinicSoftDeleteRequestedEvent) {
    const { actorEmail } = event;
    try {
      await this.mailService.sendClinicSoftDeleteRequestMail(actorEmail);
    } catch (e) {
      this.logger.error(JSON.stringify((e as Error).message));
    }
  }

  @OnEvent(CLINIC_EVENTS.MANY_SOFT_DELETED, { async: true })
  async handleManyClinicDeleted(event: ClinicSoftDeleteByOrganizationIdEvent) {
    const {
      actorEmail,
      log,
      metadata: { eventId, correlationId },
    } = event;
    try {
      if (log) {
        const { action, details, source, actorId } = log;
        this.logger.log({
          action,
          source,
          details,
          metadata: { eventId, correlationId },
          actorId,
        });
      }

      if (actorEmail)
        await this.mailService.sendClinicSoftDeleteRequestMail(actorEmail);
    } catch (e) {
      this.logger.error(JSON.stringify((e as Error).message));
    }
  }
}
