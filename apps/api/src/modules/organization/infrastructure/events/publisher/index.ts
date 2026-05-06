import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';
import {
  IOrganizationSoftDeleteEvent,
  OrganizationSoftDeleteEvent,
} from '@modules/organization/domain/events';

@Injectable()
export class OrganizationEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  softDeleteOrganization(event: IOrganizationSoftDeleteEvent) {
    this.contextService.addEvent(
      OrganizationSoftDeleteEvent.NAME,
      new OrganizationSoftDeleteEvent(event)
    );
  }
}
