import { Module } from '@nestjs/common';
import { OrganizationsSoftDeletedListener } from '@modules/organization/infrastructure/events/listeners/organizations-soft-deleted.listener';
import { OrganizationEventPublisher } from '@modules/organization/infrastructure/events/organization-event-publisher.service';
import { ORGANIZATION_EVENT_PUBLISHER } from '@modules/organization/domain/interfaces/organization-event-publisher.interface';

@Module({
  providers: [
    OrganizationsSoftDeletedListener,
    {
      provide: ORGANIZATION_EVENT_PUBLISHER,
      useClass: OrganizationEventPublisher,
    },
  ],
  exports: [ORGANIZATION_EVENT_PUBLISHER],
})
export class OrganizationEventModule {}
