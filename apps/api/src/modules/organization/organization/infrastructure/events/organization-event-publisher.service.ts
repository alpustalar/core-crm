import { Inject, Injectable } from '@nestjs/common';
import {
  OrganizationDeletionRequestedEvent,
  OrganizationDeletionRequestedEventPayload,
  OrganizationSoftDeleteEvent,
  OrganizationSoftDeleteEventPayload,
} from '@modules/organization/organization/domain/events';
import { IOrganizationEventPublisher } from '@modules/organization/organization/domain/interfaces/organization-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/context.service.interface';

@Injectable()
export class OrganizationEventPublisher implements IOrganizationEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  softDeleteOrganization(payload: OrganizationSoftDeleteEventPayload) {
    this.contextService.addEvent(new OrganizationSoftDeleteEvent(payload));
  }

  deletionRequested(payload: OrganizationDeletionRequestedEventPayload) {
    this.contextService.addEvent(
      new OrganizationDeletionRequestedEvent(payload)
    );
  }
}
