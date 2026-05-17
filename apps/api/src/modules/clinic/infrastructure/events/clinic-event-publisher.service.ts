import { Injectable } from '@nestjs/common';
import {
  ClinicSoftDeleteByOrganizationIdEvent,
  ClinicSoftDeleteByOrganizationIdEventPayload,
} from '@modules/clinic/domain/events/clinic-soft-delete-by-organization-id.event';
import {
  ClinicCreatedEvent,
  ClinicCreatedEventPayload,
} from '@modules/clinic/domain/events';
import { ContextService } from '@src/infrastructure/context/context.service';
import { IClinicEventPublisher } from '@modules/clinic/domain/interfaces/clinic.event-publisher.interface';

@Injectable()
export class ClinicEventPublisher implements IClinicEventPublisher {
  constructor(private readonly contextService: ContextService) {}

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
