import { Inject, Injectable } from '@nestjs/common';
import {
  OrganizationSoftDeleteEvent,
  OrganizationSoftDeleteEventPayload,
} from '@modules/organization/domain/events';
import { IOrganizationEventPublisher } from '@modules/organization/domain/interfaces/organization-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class OrganizationEventPublisher implements IOrganizationEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  softDeleteOrganization(payload: OrganizationSoftDeleteEventPayload) {
    this.contextService.addEvent(new OrganizationSoftDeleteEvent(payload));
  }
}
