import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IMailService,
  MAIL_SERVICE,
} from '@modules/platform/mail/domain/interfaces/mail.service.interface';
import { OrganizationDeletionRequestedEvent } from '@modules/organization/organization/domain/events';

@Injectable()
export class OrganizationDeletionRequestedListener {
  private readonly logger = new Logger(
    OrganizationDeletionRequestedListener.name
  );

  constructor(
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService
  ) {}

  @OnEvent(OrganizationDeletionRequestedEvent.NAME, { async: true })
  async handle(event: OrganizationDeletionRequestedEvent) {
    const { organizationId, actorEmail, adminRequestId } = event;
    try {
      await this.mailService.sendOrganizationDeletionRequestMail(actorEmail);
      this.logger.log('Organization deletion request mail sent', {
        organizationId,
        adminRequestId,
        actorEmail,
      });
    } catch (e) {
      this.logger.error('Failed to send organization deletion request mail', {
        organizationId,
        adminRequestId,
        error: JSON.stringify(e),
      });
    }
  }
}
