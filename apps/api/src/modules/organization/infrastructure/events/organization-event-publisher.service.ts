import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/persistence/prisma/context/context.service';
import {
  OrganizationSoftDeleteEvent,
  OrganizationSoftDeleteEventPayload,
} from '@modules/organization/domain/events';

@Injectable()
export class OrganizationEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  softDeleteOrganization(payload: OrganizationSoftDeleteEventPayload) {
    this.contextService.addEvent(
      OrganizationSoftDeleteEvent.NAME,
      new OrganizationSoftDeleteEvent(payload)
    );
  }
}
