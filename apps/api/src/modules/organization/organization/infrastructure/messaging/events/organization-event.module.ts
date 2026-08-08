import { Module } from '@nestjs/common';
import { OrganizationsSoftDeletedListener } from '@modules/organization/organization/infrastructure/messaging/events/listeners/organizations-soft-deleted.listener';
import { OrganizationDeletionRequestedListener } from '@modules/organization/organization/infrastructure/messaging/events/listeners/organization-deletion-requested.listener';
import { OrganizationEventPublisher } from '@modules/organization/organization/infrastructure/messaging/events/organization-event-publisher.service';
import { ORGANIZATION_EVENT_PUBLISHER } from '@modules/organization/organization/domain/interfaces/organization-event-publisher.interface';
import { MAIL_SERVICE } from '@src/infrastructure/mail/interfaces/mail.service.interface';
import { MailService } from '@src/infrastructure/mail/mail.service';

@Module({
  providers: [
    OrganizationsSoftDeletedListener,
    OrganizationDeletionRequestedListener,
    {
      provide: ORGANIZATION_EVENT_PUBLISHER,
      useClass: OrganizationEventPublisher,
    },
    {
      provide: MAIL_SERVICE,
      useClass: MailService,
    },
  ],
  exports: [ORGANIZATION_EVENT_PUBLISHER],
})
export class OrganizationEventModule {}
