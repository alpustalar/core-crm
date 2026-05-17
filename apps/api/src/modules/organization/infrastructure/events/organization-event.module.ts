import { Module } from '@nestjs/common';
import { OrganizationsSoftDeletedListener } from '@modules/organization/infrastructure/events/listeners/organizations-soft-deleted.listener';
import { OrganizationEventPublisher } from '@modules/organization/infrastructure/events/organization-event-publisher.service';

@Module({
  providers: [OrganizationsSoftDeletedListener, OrganizationEventPublisher],
})
export class OrganizationEventModule {}
