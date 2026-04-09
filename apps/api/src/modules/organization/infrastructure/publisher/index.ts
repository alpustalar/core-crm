import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';
import { ORGANIZATION_EVENTS } from '@common/constants/events';
import { OrganizationSoftDeleteEvent } from '@modules/organization/domain/events';

@Injectable()
export class OrganizationEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  deleteOrganization(event: OrganizationSoftDeleteEvent) {
    this.contextService.addEvent(
      ORGANIZATION_EVENTS.SOFT_DELETED,
      new OrganizationSoftDeleteEvent(event)
    );
  }
}
