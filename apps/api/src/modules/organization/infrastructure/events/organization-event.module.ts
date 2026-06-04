import { Module } from '@nestjs/common';
import { OrganizationsSoftDeletedListener } from '@modules/organization/infrastructure/events/listeners/organizations-soft-deleted.listener';
import { OrganizationDeletionRequestedListener } from '@modules/organization/infrastructure/events/listeners/organization-deletion-requested.listener';
import { OrganizationEventPublisher } from '@modules/organization/infrastructure/events/organization-event-publisher.service';
import { ORGANIZATION_EVENT_PUBLISHER } from '@modules/organization/domain/interfaces/organization-event-publisher.interface';
import { MAIL_SERVICE } from '@modules/mail/domain/interfaces/mail.service.interface';
import { MailService } from '@modules/mail/mail.service';

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
