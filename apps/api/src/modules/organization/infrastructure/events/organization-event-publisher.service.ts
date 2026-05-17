import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/context/context.service';
import {
  OrganizationSoftDeleteEvent,
  OrganizationSoftDeleteEventPayload,
} from '@modules/organization/domain/events';

@Injectable()
export class OrganizationEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  softDeleteOrganization(payload: OrganizationSoftDeleteEventPayload) {
    this.contextService.addEvent(new OrganizationSoftDeleteEvent(payload));
  }
}
