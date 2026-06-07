import { Inject, Injectable } from '@nestjs/common';
import {
  ClinicSoftDeleteByOrganizationIdEvent,
  ClinicSoftDeleteByOrganizationIdEventPayload,
} from '@modules/organization/clinic/domain/events/clinic-soft-delete-by-organization-id.event';
import {
  ClinicCreatedEvent,
  ClinicCreatedEventPayload,
} from '@modules/organization/clinic/domain/events';
import { IClinicEventPublisher } from '@modules/organization/clinic/domain/interfaces/clinic.event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class ClinicEventPublisher implements IClinicEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  softDeleteClinicByOrganizationId(
    payload: ClinicSoftDeleteByOrganizationIdEventPayload
  ) {
    this.contextService.addEvent(
      new ClinicSoftDeleteByOrganizationIdEvent(payload)
    );
  }

  createClinic(payload: ClinicCreatedEventPayload) {
    this.contextService.addEvent(new ClinicCreatedEvent(payload));
  }
}
