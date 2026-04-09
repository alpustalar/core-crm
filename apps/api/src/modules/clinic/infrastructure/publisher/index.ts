import { Injectable } from '@nestjs/common';
import { CLINIC_EVENTS } from '@common/constants/events';
import { ClinicSoftDeletedEvent } from '@modules/clinic/domain/events/clinic-soft-deleted.event';
import { ClinicCreatedEvent } from '@modules/clinic/domain/events';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';

@Injectable()
export class ClinicEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  deleteClinic(event: ClinicSoftDeletedEvent) {
    this.contextService.addEvent(
      CLINIC_EVENTS.SOFT_DELETED,
      new ClinicSoftDeletedEvent(event)
    );
  }

  createClinic(event: ClinicCreatedEvent) {
    this.contextService.addEvent(
      CLINIC_EVENTS.CREATED,
      new ClinicCreatedEvent(event)
    );
  }
}
