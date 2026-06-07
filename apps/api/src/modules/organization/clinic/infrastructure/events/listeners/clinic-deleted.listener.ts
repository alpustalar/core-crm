import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from '@modules/platform/audit-log/audit-log.service';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { ClinicSoftDeleteByOrganizationIdEvent } from '@modules/organization/clinic/domain/events';
import {
  IMailService,
  MAIL_SERVICE,
} from '@modules/platform/mail/domain/interfaces/mail.service.interface';
import { LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class ClinicDeletedListener {
  private readonly logger = new Logger(ClinicDeletedListener.name);
  constructor(
    private auditLogService: AuditLogService,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService
  ) {}

  @OnEvent(CLINIC_EVENTS.SOFT_DELETED, { async: true })
  async handleOrganizationDeleted(
    event: ClinicSoftDeleteByOrganizationIdEvent
  ) {
    const {
      actorEmail,
      log,
      metadata: { eventId, correlationId },
    } = event;
    try {
      if (log) {
        const { action, details, source, actorId, type } = log;

        const auditLogInput = {
          action,
          source,
          details,
          metadata: { eventId, correlationId },
          actorId,
        };

        if (type === LogType.SECURITY) {
          await this.auditLogService.security(auditLogInput);
          return;
        }

        if (type === LogType.INFO) {
          this.logger.log(auditLogInput);
          return;
        }
      }

      if (actorEmail)
        await this.mailService.sendClinicSoftDeleteRequestMail(actorEmail);

      return;
    } catch (e) {
      // eslint-disable-next-line
      this.logger.error(JSON.stringify(e.message));
    }
  }
}
