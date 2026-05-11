import { Injectable } from '@nestjs/common';
import {
  ClinicSoftDeleteByOrganizationIdEvent,
  ClinicSoftDeleteByOrganizationIdEventParams,
} from '@modules/clinic/domain/events/clinic-soft-delete-by-organization-id.event';
import {
  ClinicCreatedEvent,
  IClinicCreatedEvent,
} from '@modules/clinic/domain/events';
import { ContextService } from '@src/infrastructure/persistence/prisma/context/context.service';
import { IClinicEventPublisher } from '@modules/clinic/domain/interfaces/clinic.event-publisher.interface';

@Injectable()
export class ClinicEventPublisher implements IClinicEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  softDeleteClinicByOrganizationId(
    event: ClinicSoftDeleteByOrganizationIdEventParams
  ) {
    this.contextService.addEvent(
      ClinicSoftDeleteByOrganizationIdEvent.NAME,
      new ClinicSoftDeleteByOrganizationIdEvent(event)
    );
  }

  createClinic(event: IClinicCreatedEvent) {
    this.contextService.addEvent(
      ClinicCreatedEvent.NAME,
      new ClinicCreatedEvent(event)
    );
  }
}
