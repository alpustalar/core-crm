import { Injectable } from '@nestjs/common';
import { ClinicSoftDeletedEvent } from '@modules/clinic/domain/events/clinic-soft-deleted.event';
import { ClinicCreatedEvent } from '@modules/clinic/domain/events';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';

@Injectable()
export class ClinicEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  deleteClinic(event: ClinicSoftDeletedEvent) {
    this.contextService.addEvent(
      ClinicSoftDeletedEvent.NAME,
      new ClinicSoftDeletedEvent(event)
    );
  }

  createClinic(event: ClinicCreatedEvent) {
    this.contextService.addEvent(
      ClinicCreatedEvent.NAME,
      new ClinicCreatedEvent(event)
    );
  }
}
